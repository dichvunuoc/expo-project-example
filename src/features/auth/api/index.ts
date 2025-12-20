import { get, post } from '@/lib/axios';
import { ErrorHandler, AuthenticationError } from '@/lib/error-handler';
import {
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
  ResetPasswordData,
  ChangePasswordData,
  User,
} from '../types';

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const { data } = await post<AuthResponse>('/auth/login', credentials);
    return data;
  } catch (error) {
    // Convert generic errors to AuthenticationError for better user experience
    if (error.status === 401) {
      throw new AuthenticationError(
        'Invalid email or password. Please check your credentials and try again.',
        { originalError: error }
      );
    }

    if (error.status === 422) {
      throw new AuthenticationError(
        'Invalid input. Please check all fields and try again.',
        { originalError: error, validationErrors: error.details }
      );
    }

    // Re-throw the error with proper handling
    throw ErrorHandler.handle(error);
  }
};

export const registerUser = async (
  userData: RegisterUserData
): Promise<AuthResponse> => {
  try {
    const { data } = await post<AuthResponse>('/auth/register', userData);
    return data;
  } catch (error) {
    if (error.status === 409) {
      throw new AuthenticationError(
        'Email already registered. Please use a different email or try logging in.',
        { originalError: error }
      );
    }

    if (error.status === 422) {
      throw new AuthenticationError(
        'Invalid registration data. Please check all fields and try again.',
        { originalError: error, validationErrors: error.details }
      );
    }

    throw ErrorHandler.handle(error);
  }
};

export const refreshToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  try {
    const { data } = await post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return data;
  } catch (error) {
    // Refresh token failures should trigger logout
    if (error.status === 401 || error.status === 400) {
      throw new AuthenticationError('Session expired. Please log in again.', {
        originalError: error,
        shouldLogout: true,
      });
    }

    throw ErrorHandler.handle(error);
  }
};

export const resetPassword = async (
  resetData: ResetPasswordData
): Promise<{ message: string }> => {
  try {
    const { data } = await post<{ message: string }>(
      '/auth/reset-password',
      resetData
    );
    return data;
  } catch (error) {
    if (error.status === 404) {
      throw new AuthenticationError(
        'Email not found. Please check the email address and try again.',
        { originalError: error }
      );
    }

    throw ErrorHandler.handle(error);
  }
};

export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<{ message: string }> => {
  try {
    const { data } = await post<{ message: string }>(
      '/auth/change-password',
      passwordData
    );
    return data;
  } catch (error) {
    if (error.status === 400) {
      throw new AuthenticationError(
        'Current password is incorrect or new passwords do not match.',
        { originalError: error, validationErrors: error.details }
      );
    }

    throw ErrorHandler.handle(error);
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const { data } = await get<User>('/auth/me');
    return data;
  } catch (error) {
    if (error.status === 401) {
      throw new AuthenticationError(
        'Authentication required. Please log in again.',
        { originalError: error }
      );
    }

    throw ErrorHandler.handle(error);
  }
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    const { data } = await post<{ message: string }>('/auth/logout');
    return data;
  } catch (error) {
    // Logout should not fail user experience, so we log but don't throw
    ErrorHandler.log(error, 'Logout Error');
    return { message: 'Logged out successfully' };
  }
};
