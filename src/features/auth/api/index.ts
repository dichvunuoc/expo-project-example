import { get, post } from '@/lib/axios';
import {
  APIError,
  ErrorHandler,
  AuthenticationError,
} from '@/lib/error-handler';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
  ResetPasswordData,
  ChangePasswordData,
  User,
} from '../types';

/**
 * Helper to check if error is an APIError with specific status
 */
const isAPIErrorWithStatus = (
  error: unknown,
  status: number
): error is APIError => {
  return error instanceof APIError && error.status === status;
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    return await post<AuthResponse, LoginCredentials>(
      '/auth/login',
      credentials
    );
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    // Convert generic errors to AuthenticationError for better user experience
    if (apiError.status === 401) {
      throw new AuthenticationError(
        'Invalid email or password. Please check your credentials and try again.',
        { originalError: apiError }
      );
    }

    if (apiError.status === 422) {
      throw new AuthenticationError(
        'Invalid input. Please check all fields and try again.',
        {
          originalError: apiError,
          validationErrors: apiError.details?.validationErrors,
        }
      );
    }

    throw apiError;
  }
};

export const registerUser = async (
  userData: RegisterUserData
): Promise<AuthResponse> => {
  try {
    return await post<AuthResponse, RegisterUserData>(
      '/auth/register',
      userData
    );
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    if (apiError.status === 409) {
      throw new AuthenticationError(
        'Email already registered. Please use a different email or try logging in.',
        { originalError: apiError }
      );
    }

    if (apiError.status === 422) {
      throw new AuthenticationError(
        'Invalid registration data. Please check all fields and try again.',
        {
          originalError: apiError,
          validationErrors: apiError.details?.validationErrors,
        }
      );
    }

    throw apiError;
  }
};

export const refreshToken = async (token: string): Promise<AuthResponse> => {
  try {
    return await post<AuthResponse, { refreshToken: string }>('/auth/refresh', {
      refreshToken: token,
    });
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    // Refresh token failures should trigger logout
    if (apiError.status === 401 || apiError.status === 400) {
      throw new AuthenticationError('Session expired. Please log in again.', {
        originalError: apiError,
        shouldLogout: true,
      });
    }

    throw apiError;
  }
};

export const resetPassword = async (
  resetData: ResetPasswordData
): Promise<{ message: string }> => {
  try {
    return await post<{ message: string }, ResetPasswordData>(
      '/auth/reset-password',
      resetData
    );
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    if (apiError.status === 404) {
      throw new AuthenticationError(
        'Email not found. Please check the email address and try again.',
        { originalError: apiError }
      );
    }

    throw apiError;
  }
};

export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<{ message: string }> => {
  try {
    return await post<{ message: string }, ChangePasswordData>(
      '/auth/change-password',
      passwordData
    );
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    if (apiError.status === 400) {
      throw new AuthenticationError(
        'Current password is incorrect or new passwords do not match.',
        {
          originalError: apiError,
          validationErrors: apiError.details?.validationErrors,
        }
      );
    }

    throw apiError;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    return await get<User>('/auth/me');
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

    if (apiError.status === 401) {
      throw new AuthenticationError(
        'Authentication required. Please log in again.',
        { originalError: apiError }
      );
    }

    throw apiError;
  }
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    return await post<{ message: string }>('/auth/logout');
  } catch (error) {
    // Logout should not fail user experience, so we log but don't throw
    const apiError = ErrorHandler.handle(error);
    ErrorHandler.log(apiError, 'Logout Error');
    return { message: 'Logged out successfully' };
  }
};
