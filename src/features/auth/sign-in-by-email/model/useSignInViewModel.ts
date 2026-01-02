/**
 * Sign In ViewModel Hook
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * This ViewModel hook encapsulates all sign-in business logic,
 * form handling, and API interactions. The View (SignInForm)
 * should only call this hook and render JSX.
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useForm, type FieldErrors, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignInMutation } from '../api';
import { signInSchema, type SignInFormData } from './schema';

/**
 * ViewModel return type interface
 * Clearly defines the contract between View and ViewModel
 */
export interface SignInViewModelReturn {
  /** Form state and controls */
  form: {
    control: Control<SignInFormData>;
    errors: FieldErrors<SignInFormData>;
  };
  /** Actions exposed to View */
  actions: {
    onSubmit: () => void;
  };
  /** UI state */
  state: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
}

/**
 * Sign In ViewModel Hook
 *
 * Responsibilities:
 * - Form state management (React Hook Form)
 * - Form validation (Zod schema)
 * - API mutation handling
 * - Error handling and user feedback
 *
 * @returns SignInViewModelReturn - Form controls, actions, and state
 */
export const useSignInViewModel = (): SignInViewModelReturn => {
  // API mutation hook from Model layer
  const signInMutation = useSignInMutation();

  // Form setup with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle successful form submission
   * Calls API mutation with validated data
   */
  const handleSignIn = useCallback(
    (data: SignInFormData) => {
      signInMutation.mutate(data);
    },
    [signInMutation]
  );

  /**
   * Handle validation errors
   * Shows alert with first validation error message
   */
  const handleValidationError = useCallback(
    (validationErrors: FieldErrors<SignInFormData>) => {
      const firstError = Object.values(validationErrors)[0];
      if (firstError?.message) {
        Alert.alert('Validation Error', firstError.message);
      }
    },
    []
  );

  /**
   * Submit handler exposed to View
   * Wraps handleSubmit with validation error handler
   */
  const onSubmit = useCallback(() => {
    handleSubmit(handleSignIn, handleValidationError)();
  }, [handleSubmit, handleSignIn, handleValidationError]);

  return {
    form: {
      control,
      errors,
    },
    actions: {
      onSubmit,
    },
    state: {
      isPending: signInMutation.isPending,
      isError: signInMutation.isError,
      error: signInMutation.error,
    },
  };
};
