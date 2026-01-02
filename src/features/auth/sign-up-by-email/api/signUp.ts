/**
 * Sign Up API
 * FSD Layer: Features
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { post, ErrorHandler, AuthenticationError } from '@/shared/api';
import {
  useSessionStore,
  type AuthResponse,
  type RegisterUserData,
} from '@/entities/session';

/**
 * Register API call
 */
export const signUpUser = async (
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

/**
 * Sign Up Mutation Hook
 */
export const useSignUpMutation = () => {
  const signIn = useSessionStore((state) => state.signIn);
  const router = useRouter();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      signIn(data.token, data.user);
      router.replace('/(tabs)');
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('[SignUp] Error:', error.message);
      }
    },
  });
};
