/**
 * Sign Up ViewModel Hook
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * This ViewModel hook encapsulates all sign-up business logic,
 * form handling, and API interactions. The View (SignUpForm)
 * should only call this hook and render JSX.
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useForm, type FieldErrors, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignUpMutation } from '../api';
import { signUpSchema, type SignUpFormData } from './schema';

/**
 * ViewModel return type interface
 * Clearly defines the contract between View and ViewModel
 */
export interface SignUpViewModelReturn {
  /** Form state and controls */
  form: {
    control: Control<SignUpFormData>;
    errors: FieldErrors<SignUpFormData>;
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
 * Sign Up ViewModel Hook
 *
 * Responsibilities:
 * - Form state management (React Hook Form)
 * - Form validation (Zod schema with password confirmation)
 * - API mutation handling
 * - Data transformation (exclude confirmPassword before API call)
 * - Error handling and user feedback
 *
 * @returns SignUpViewModelReturn - Form controls, actions, and state
 */
export const useSignUpViewModel = (): SignUpViewModelReturn => {
  // API mutation hook from Model layer
  const signUpMutation = useSignUpMutation();

  // Form setup with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handle successful form submission
   * Transforms data (removes confirmPassword) before API call
   */
  const handleSignUp = useCallback(
    (data: SignUpFormData) => {
      // Transform: exclude confirmPassword from API payload
      signUpMutation.mutate({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    },
    [signUpMutation]
  );

  /**
   * Handle validation errors
   * Shows alert with first validation error message
   */
  const handleValidationError = useCallback(
    (validationErrors: FieldErrors<SignUpFormData>) => {
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
    handleSubmit(handleSignUp, handleValidationError)();
  }, [handleSubmit, handleSignUp, handleValidationError]);

  return {
    form: {
      control,
      errors,
    },
    actions: {
      onSubmit,
    },
    state: {
      isPending: signUpMutation.isPending,
      isError: signUpMutation.isError,
      error: signUpMutation.error,
    },
  };
};
