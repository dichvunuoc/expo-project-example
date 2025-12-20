import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { User, LoginCredentials, RegisterUserData } from '../types';
import { authService, AuthResult } from '../domain/auth.service';
import { logger, user } from '@/utils/logger';

/**
 * Auth hook state
 */
interface AuthState {
  isLoading: boolean;
  error?: string;
  lastAction?: string;
}

/**
 * Enhanced auth hook with domain service integration
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, isHydrated, signIn, signOut } =
    useAuthStore();

  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info(
          'Initializing auth state',
          {},
          {
            component: 'useAuth',
            action: 'initialize',
          }
        );

        const currentAuth = await authService.getCurrentAuth();

        if (
          currentAuth.isAuthenticated &&
          currentAuth.user &&
          currentAuth.token
        ) {
          signIn(currentAuth.token, currentAuth.user);
          logger.info(
            'Auth state restored from storage',
            {
              userId: currentAuth.user.id,
              email: currentAuth.user.email,
            },
            {
              component: 'useAuth',
              action: 'authRestored',
            }
          );
        } else {
          logger.info(
            'No valid auth session found',
            {},
            {
              component: 'useAuth',
              action: 'noSession',
            }
          );
        }
      } catch (error) {
        logger.error('Failed to initialize auth state', error, {
          component: 'useAuth',
          action: 'initializeFailed',
        });
      }
    };

    if (isHydrated) {
      initializeAuth();
    }
  }, [isHydrated, signIn]);

  /**
   * Login with credentials using domain service
   */
  const login = useCallback(
    async (
      credentials: LoginCredentials
    ): Promise<{ success: boolean; error?: string }> => {
      setAuthState({ isLoading: true, lastAction: 'login' });

      try {
        logger.info(
          'Starting login process',
          {
            email: credentials.email,
          },
          {
            component: 'useAuth',
            action: 'loginStart',
          }
        );

        const result: AuthResult = await authService.login(credentials);

        if (result.success && result.user && result.token) {
          signIn(result.token, result.user);
          setAuthState({ isLoading: false, lastAction: 'login_success' });

          user.action('login_successful_ui', {
            userId: result.user.id,
            email: result.user.email,
          });

          logger.info(
            'Login successful in UI',
            {
              userId: result.user.id,
              email: result.user.email,
            },
            {
              component: 'useAuth',
              action: 'loginSuccess',
            }
          );

          return { success: true };
        } else {
          setAuthState({
            isLoading: false,
            error: result.error || 'Login failed',
            lastAction: 'login_failed',
          });

          user.action('login_failed_ui', {
            email: credentials.email,
            error: result.error,
          });

          logger.warn(
            'Login failed in UI',
            {
              email: credentials.email,
              error: result.error,
            },
            {
              component: 'useAuth',
              action: 'loginFailed',
            }
          );

          return {
            success: false,
            error: result.error || 'Login failed. Please try again.',
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';

        setAuthState({
          isLoading: false,
          error: errorMessage,
          lastAction: 'login_error',
        });

        user.action('login_error_ui', {
          email: credentials.email,
          error: errorMessage,
        });

        logger.error('Login error in UI', error, {
          email: credentials.email,
          component: 'useAuth',
          action: 'loginError',
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [signIn]
  );

  /**
   * Register with user data using domain service
   */
  const register = useCallback(
    async (
      userData: RegisterUserData
    ): Promise<{ success: boolean; error?: string }> => {
      setAuthState({ isLoading: true, lastAction: 'register' });

      try {
        logger.info(
          'Starting registration process',
          {
            email: userData.email,
            name: userData.name,
          },
          {
            component: 'useAuth',
            action: 'registerStart',
          }
        );

        const result: AuthResult = await authService.register(userData);

        if (result.success && result.user && result.token) {
          signIn(result.token, result.user);
          setAuthState({ isLoading: false, lastAction: 'register_success' });

          user.action('register_successful_ui', {
            userId: result.user.id,
            email: result.user.email,
            name: result.user.name,
          });

          logger.info(
            'Registration successful in UI',
            {
              userId: result.user.id,
              email: result.user.email,
              name: result.user.name,
            },
            {
              component: 'useAuth',
              action: 'registerSuccess',
            }
          );

          return { success: true };
        } else {
          setAuthState({
            isLoading: false,
            error: result.error || 'Registration failed',
            lastAction: 'register_failed',
          });

          user.action('register_failed_ui', {
            email: userData.email,
            name: userData.name,
            error: result.error,
          });

          logger.warn(
            'Registration failed in UI',
            {
              email: userData.email,
              name: userData.name,
              error: result.error,
            },
            {
              component: 'useAuth',
              action: 'registerFailed',
            }
          );

          return {
            success: false,
            error: result.error || 'Registration failed. Please try again.',
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';

        setAuthState({
          isLoading: false,
          error: errorMessage,
          lastAction: 'register_error',
        });

        user.action('register_error_ui', {
          email: userData.email,
          name: userData.name,
          error: errorMessage,
        });

        logger.error('Registration error in UI', error, {
          email: userData.email,
          component: 'useAuth',
          action: 'registerError',
        });

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [signIn]
  );

  /**
   * Logout using domain service
   */
  const logout = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setAuthState({ isLoading: true, lastAction: 'logout' });

    try {
      logger.info(
        'Starting logout process',
        {},
        {
          component: 'useAuth',
          action: 'logoutStart',
        }
      );

      const result = await authService.logout();

      if (result.success) {
        signOut();
        setAuthState({ isLoading: false, lastAction: 'logout_success' });

        user.action('logout_successful_ui', {});

        logger.info(
          'Logout successful in UI',
          {},
          {
            component: 'useAuth',
            action: 'logoutSuccess',
          }
        );

        return { success: true };
      } else {
        // Even if API logout fails, we still clear local state
        signOut();
        setAuthState({
          isLoading: false,
          error: result.error,
          lastAction: 'logout_with_api_error',
        });

        user.action('logout_with_api_error_ui', {
          error: result.error,
        });

        logger.warn(
          'Logout completed with API error',
          {
            error: result.error,
          },
          {
            component: 'useAuth',
            action: 'logoutWithApiError',
          }
        );

        return {
          success: true, // Still success because local state is cleared
          error: result.error,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Logout failed';

      // Force local logout even on error
      signOut();
      setAuthState({
        isLoading: false,
        error: errorMessage,
        lastAction: 'logout_error',
      });

      user.action('logout_error_ui', {
        error: errorMessage,
      });

      logger.error('Logout error in UI', error, {
        component: 'useAuth',
        action: 'logoutError',
      });

      return {
        success: true, // Still success because local state is cleared
        error: errorMessage,
      };
    }
  }, [signOut]);

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: undefined }));
  }, []);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setAuthState({ isLoading: true, lastAction: 'refresh_token' });

    try {
      logger.info(
        'Starting token refresh',
        {},
        {
          component: 'useAuth',
          action: 'refreshTokenStart',
        }
      );

      const result = await authService.refreshToken();

      if (result.success && result.user && result.token) {
        signIn(result.token, result.user);
        setAuthState({ isLoading: false, lastAction: 'refresh_token_success' });

        user.action('token_refresh_successful_ui', {
          userId: result.user.id,
        });

        logger.info(
          'Token refresh successful in UI',
          {
            userId: result.user.id,
          },
          {
            component: 'useAuth',
            action: 'refreshTokenSuccess',
          }
        );

        return { success: true };
      } else {
        // Token refresh failed, logout user
        signOut();
        setAuthState({
          isLoading: false,
          error: result.error || 'Session expired',
          lastAction: 'refresh_token_failed',
        });

        user.action('token_refresh_failed_ui', {
          error: result.error,
        });

        logger.warn(
          'Token refresh failed in UI',
          {
            error: result.error,
          },
          {
            component: 'useAuth',
            action: 'refreshTokenFailed',
          }
        );

        return {
          success: false,
          error: result.error || 'Session expired. Please log in again.',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token refresh failed';

      // Force logout on refresh error
      signOut();
      setAuthState({
        isLoading: false,
        error: errorMessage,
        lastAction: 'refresh_token_error',
      });

      user.action('token_refresh_error_ui', {
        error: errorMessage,
      });

      logger.error('Token refresh error in UI', error, {
        component: 'useAuth',
        action: 'refreshTokenError',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [signIn]);

  return {
    // Auth state
    user,
    token,
    isAuthenticated,
    isHydrated,

    // UI state
    isLoading: authState.isLoading,
    error: authState.error,
    lastAction: authState.lastAction,

    // Auth actions
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };
};
