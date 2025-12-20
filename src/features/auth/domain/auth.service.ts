/**
 * Auth Domain Service
 * Implements business logic for authentication operations
 */

import { CONFIG, STORAGE_KEYS } from '@/constants';
import { api, logger, user } from '@/utils/logger';
import { MMKV } from 'react-native-mmkv';
import {
  loginUser as loginUserApi,
  registerUser as registerUserApi,
} from '../api';
import {
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
  User,
} from '../types';

/**
 * Authentication result with additional metadata
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Storage manager for authentication data
 */
class AuthStorage {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKV({ id: 'auth-storage' });
  }

  /**
   * Save authentication data to storage
   */
  async saveAuth(authData: AuthResponse): Promise<void> {
    try {
      this.storage.set(STORAGE_KEYS.AUTH_TOKEN, authData.token);

      if (authData.refreshToken) {
        this.storage.set(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
      }

      if (authData.user) {
        this.storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
      }

      logger.info(
        'Auth data saved to storage',
        {
          hasToken: !!authData.token,
          hasRefreshToken: !!authData.refreshToken,
          hasUserData: !!authData.user,
          expiresIn: authData.expiresIn,
        },
        {
          component: 'AuthService',
          action: 'saveAuth',
        }
      );
    } catch (error) {
      logger.error('Failed to save auth data to storage', error, {
        component: 'AuthService',
        action: 'saveAuth',
      });
      throw new Error('Failed to save authentication data');
    }
  }

  /**
   * Get authentication data from storage
   */
  async getAuth(): Promise<{
    token?: string;
    refreshToken?: string;
    user?: User;
  }> {
    try {
      const token = this.storage.getString(STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = this.storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
      const userData = this.storage.getString(STORAGE_KEYS.USER_DATA);

      const user = userData ? JSON.parse(userData) : undefined;

      return {
        token: token || undefined,
        refreshToken: refreshToken || undefined,
        user: user,
      };
    } catch (error) {
      logger.error('Failed to get auth data from storage', error, {
        component: 'AuthService',
        action: 'getAuth',
      });
      return {
        token: undefined,
        refreshToken: undefined,
        user: undefined,
      };
    }
  }

  /**
   * Clear authentication data from storage
   */
  async clearAuth(): Promise<void> {
    try {
      this.storage.delete(STORAGE_KEYS.AUTH_TOKEN);
      this.storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
      this.storage.delete(STORAGE_KEYS.USER_DATA);

      logger.info(
        'Auth data cleared from storage',
        {},
        {
          component: 'AuthService',
          action: 'clearAuth',
        }
      );
    } catch (error) {
      logger.error('Failed to clear auth data from storage', error, {
        component: 'AuthService',
        action: 'clearAuth',
      });
    }
  }

  /**
   * Check if user has valid session
   */
  async hasValidSession(): Promise<boolean> {
    try {
      const token = this.storage.getString(STORAGE_KEYS.AUTH_TOKEN);
      const userData = this.storage.getString(STORAGE_KEYS.USER_DATA);

      return !!(token && userData);
    } catch (error) {
      logger.error('Failed to check session validity', error, {
        component: 'AuthService',
        action: 'hasValidSession',
      });
      return false;
    }
  }
}

/**
 * Validator for authentication data
 */
class AuthValidator {
  /**
   * Validate login credentials
   */
  static validateLoginCredentials(
    credentials: LoginCredentials
  ): ValidationResult {
    const errors: string[] = [];

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(credentials.email)) {
      errors.push('Invalid email format');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    } else if (credentials.password.length < CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(
        `Password must be at least ${CONFIG.MIN_PASSWORD_LENGTH} characters long`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate registration data
   */
  static validateRegisterData(userData: RegisterUserData): ValidationResult {
    const errors: string[] = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.password) {
      errors.push('Password is required');
    } else if (userData.password.length < CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(
        `Password must be at least ${CONFIG.MIN_PASSWORD_LENGTH} characters long`
      );
    }

    if (!userData.name || userData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    ) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Main Authentication Service
 */
export class AuthService {
  private storage: AuthStorage;
  private requestId: string = '';

  constructor() {
    this.storage = new AuthStorage();
  }

  /**
   * User login with credentials validation
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    this.requestId = Math.random().toString(36).substring(2, 15);

    try {
      // Validate credentials before API call
      const validation = AuthValidator.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        logger.warn(
          'Login credentials validation failed',
          {
            errors: validation.errors,
          },
          {
            component: 'AuthService',
            action: 'validateLogin',
            requestId: this.requestId,
          }
        );

        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      logger.info(
        'Attempting user login',
        {
          email: credentials.email,
        },
        {
          component: 'AuthService',
          action: 'loginAttempt',
          requestId: this.requestId,
        }
      );

      // Call API
      api.request('POST', '/auth/login', credentials, this.requestId);
      const authResponse = await loginUserApi(credentials);
      api.response('POST', '/auth/login', 200, authResponse, this.requestId);

      // Validate API response structure
      const responseValidation = this.validateAuthResponse(authResponse);
      if (!responseValidation.isValid) {
        throw new Error(
          `Invalid API response: ${responseValidation.errors.join(', ')}`
        );
      }

      // Save to storage
      await this.storage.saveAuth(authResponse);

      // Track successful login
      user.action('login_success', {
        userId: authResponse.user.id,
        email: authResponse.user.email,
        hasRefreshToken: !!authResponse.refreshToken,
        expiresIn: authResponse.expiresIn,
      });

      logger.info(
        'User login successful',
        {
          userId: authResponse.user.id,
          email: authResponse.user.email,
          hasToken: !!authResponse.token,
        },
        {
          component: 'AuthService',
          action: 'loginSuccess',
          requestId: this.requestId,
        }
      );

      return {
        success: true,
        user: authResponse.user,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        expiresIn: authResponse.expiresIn,
      };
    } catch (error) {
      api.error('POST', '/auth/login', error, this.requestId);

      // Track failed login
      user.action('login_failed', {
        email: credentials.email,
        errorType: error.name || 'Unknown',
        errorMessage: error.message,
      });

      logger.error('Login failed', error, {
        email: credentials.email,
        component: 'AuthService',
        action: 'loginFailed',
        requestId: this.requestId,
      });

      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    }
  }

  /**
   * User registration with validation
   */
  async register(userData: RegisterUserData): Promise<AuthResult> {
    this.requestId = Math.random().toString(36).substring(2, 15);

    try {
      // Validate registration data before API call
      const validation = AuthValidator.validateRegisterData(userData);
      if (!validation.isValid) {
        logger.warn(
          'Registration data validation failed',
          {
            errors: validation.errors,
          },
          {
            component: 'AuthService',
            action: 'validateRegister',
            requestId: this.requestId,
          }
        );

        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      logger.info(
        'Attempting user registration',
        {
          email: userData.email,
          name: userData.name,
        },
        {
          component: 'AuthService',
          action: 'registerAttempt',
          requestId: this.requestId,
        }
      );

      // Call API
      api.request('POST', '/auth/register', userData, this.requestId);
      const authResponse = await registerUserApi(userData);
      api.response('POST', '/auth/register', 201, authResponse, this.requestId);

      // Validate API response structure
      const responseValidation = this.validateAuthResponse(authResponse);
      if (!responseValidation.isValid) {
        throw new Error(
          `Invalid API response: ${responseValidation.errors.join(', ')}`
        );
      }

      // Save to storage
      await this.storage.saveAuth(authResponse);

      // Track successful registration
      user.action('register_success', {
        userId: authResponse.user.id,
        email: authResponse.user.email,
        name: authResponse.user.name,
      });

      logger.info(
        'User registration successful',
        {
          userId: authResponse.user.id,
          email: authResponse.user.email,
          name: authResponse.user.name,
        },
        {
          component: 'AuthService',
          action: 'registerSuccess',
          requestId: this.requestId,
        }
      );

      return {
        success: true,
        user: authResponse.user,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        expiresIn: authResponse.expiresIn,
      };
    } catch (error) {
      api.error('POST', '/auth/register', error, this.requestId);

      // Track failed registration
      user.action('register_failed', {
        email: userData.email,
        name: userData.name,
        errorType: error.name || 'Unknown',
        errorMessage: error.message,
      });

      logger.error('Registration failed', error, {
        email: userData.email,
        component: 'AuthService',
        action: 'registerFailed',
        requestId: this.requestId,
      });

      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    this.requestId = Math.random().toString(36).substring(2, 15);

    try {
      logger.info(
        'Attempting user logout',
        {},
        {
          component: 'AuthService',
          action: 'logoutAttempt',
          requestId: this.requestId,
        }
      );

      // Clear storage
      await this.storage.clearAuth();

      // Track logout
      user.action('logout_success', {});

      logger.info(
        'User logout successful',
        {},
        {
          component: 'AuthService',
          action: 'logoutSuccess',
          requestId: this.requestId,
        }
      );

      return { success: true };
    } catch (error) {
      logger.error('Logout failed', error, {
        component: 'AuthService',
        action: 'logoutFailed',
        requestId: this.requestId,
      });

      return {
        success: false,
        error: error.message || 'Logout failed. Please try again.',
      };
    }
  }

  /**
   * Get current authentication state
   */
  async getCurrentAuth(): Promise<{
    isAuthenticated: boolean;
    user?: User;
    token?: string;
  }> {
    try {
      const authData = await this.storage.getAuth();
      const hasValidSession = await this.storage.hasValidSession();

      return {
        isAuthenticated: hasValidSession && !!authData.token,
        user: authData.user,
        token: authData.token,
      };
    } catch (error) {
      logger.error('Failed to get current auth state', error, {
        component: 'AuthService',
        action: 'getCurrentAuth',
      });

      return {
        isAuthenticated: false,
        user: undefined,
        token: undefined,
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResult> {
    this.requestId = Math.random().toString(36).substring(2, 15);

    try {
      const authData = await this.storage.getAuth();

      if (!authData.refreshToken) {
        throw new Error('No refresh token available');
      }

      logger.info(
        'Attempting token refresh',
        {},
        {
          component: 'AuthService',
          action: 'refreshTokenAttempt',
          requestId: this.requestId,
        }
      );

      // TODO: Implement token refresh API call
      // const response = await refreshTokenApi(authData.refreshToken);

      // For now, simulate successful refresh
      const refreshResponse: AuthResponse = {
        token: 'new-token-' + Date.now(),
        user: authData.user!,
        refreshToken: 'new-refresh-token-' + Date.now(),
        expiresIn: CONFIG.SESSION_TIMEOUT,
      };

      await this.storage.saveAuth(refreshResponse);

      logger.info(
        'Token refresh successful',
        {},
        {
          component: 'AuthService',
          action: 'refreshTokenSuccess',
          requestId: this.requestId,
        }
      );

      return {
        success: true,
        user: refreshResponse.user,
        token: refreshResponse.token,
        refreshToken: refreshResponse.refreshToken,
        expiresIn: refreshResponse.expiresIn,
      };
    } catch (error) {
      logger.error('Token refresh failed', error, {
        component: 'AuthService',
        action: 'refreshTokenFailed',
        requestId: this.requestId,
      });

      // Clear auth on refresh failure
      await this.storage.clearAuth();

      return {
        success: false,
        error: 'Session expired. Please log in again.',
      };
    }
  }

  /**
   * Validate API response structure
   */
  private validateAuthResponse(response: AuthResponse): ValidationResult {
    const errors: string[] = [];

    if (!response.token) {
      errors.push('Response missing token');
    }

    if (!response.user) {
      errors.push('Response missing user data');
    }

    if (!response.user.id) {
      errors.push('Response missing user ID');
    }

    if (!response.user.email) {
      errors.push('Response missing user email');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if user session is about to expire
   */
  async isSessionExpiringSoon(): Promise<boolean> {
    try {
      const authData = await this.storage.getAuth();
      // TODO: Implement token expiration checking
      // This would need to store token timestamp or parse JWT
      return false;
    } catch (error) {
      logger.error('Failed to check session expiration', error, {
        component: 'AuthService',
        action: 'isSessionExpiringSoon',
      });
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types for external use
export type { AuthResult, ValidationResult };
export default authService;
