/**
 * Sign In API
 * FSD Layer: Features
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { post, ErrorHandler, AuthenticationError } from '@/shared/api';
import {
  useSessionStore,
  type AuthResponse,
  type LoginCredentials,
} from '@/entities/session';

/**
 * Login API call
 */
export const signInUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    return await post<AuthResponse, LoginCredentials>(
      '/auth/login',
      credentials
    );
  } catch (error) {
    const apiError = ErrorHandler.handle(error);

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

/**
 * Sign In Mutation Hook
 */
export const useSignInMutation = () => {
  const signIn = useSessionStore((state) => state.signIn);
  const router = useRouter();

  return useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {
      signIn(data.token, data.user);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('[SignIn] Error:', error.message);
      }
    },
  });
};
