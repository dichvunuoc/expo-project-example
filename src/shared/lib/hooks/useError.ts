import { error as logger } from '@/shared/lib/logger';
import Constants from 'expo-constants';
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface ErrorOptions {
  title?: string;
  fallbackMessage?: string;
  showInDev?: boolean;
  logToService?: boolean;
}

export const useErrorHandler = () => {
  const IS_DEV =
    Constants.expoConfig?.extra?.ENVIRONMENT === 'development' || __DEV__;

  const handleError = useCallback(
    (error: unknown, options: ErrorOptions = {}) => {
      const {
        title = 'Error',
        fallbackMessage = 'An unexpected error occurred. Please try again.',
        showInDev = true,
        logToService = true,
      } = options;

      let message = fallbackMessage;

      // Extract error message
      if (error) {
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          message = String(error.message);
        }

        // Log to console using logger utility
        if (showInDev || logToService) {
          logger(`${title}`, error, {
            component: 'useErrorHandler',
            action: 'handleError',
          });
        }

        // TODO: Log to error tracking service in production
        if (logToService && !IS_DEV) {
          // Example: Sentry.captureException(error);
        }
      }

      // Show user-friendly alert
      Alert.alert(title, message, [
        {
          text: 'OK',
          style: 'default',
        },
      ]);
    },
    [IS_DEV]
  );

  const handleNetworkError = useCallback(
    (error: unknown) => {
      let message = 'Network error occurred';

      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
        request?: unknown;
        message?: string;
      };
      if (errorObj?.response) {
        // Server responded with error status
        const status = errorObj.response.status;
        switch (status) {
          case 400:
            message = 'Invalid request. Please check your input.';
            break;
          case 401:
            message = 'You are not authorized. Please log in again.';
            break;
          case 403:
            message = 'You do not have permission to perform this action.';
            break;
          case 404:
            message = 'The requested resource was not found.';
            break;
          case 422:
            message = 'Validation error. Please check your input.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = `Error ${status}: ${errorObj.response.data?.message || 'Unknown error'}`;
        }
      } else if (errorObj?.request) {
        // Request was made but no response received
        message =
          'Unable to connect to server. Please check your internet connection.';
      } else if (errorObj?.message) {
        // Other errors
        message = errorObj.message;
      }

      handleError(error, {
        title: 'Network Error',
        fallbackMessage: message,
      });
    },
    [handleError]
  );

  const handleFormError = useCallback(
    (error: unknown) => {
      let message = 'Form validation failed';

      const errorObj = error as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
        message?: string;
      };
      if (errorObj?.response?.data?.errors) {
        // Handle Laravel/Express validation errors
        const errors = errorObj.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        message = Array.isArray(firstError)
          ? firstError[0]
          : String(firstError);
      } else if (errorObj?.response?.data?.message) {
        message = errorObj.response.data.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      handleError(error, {
        title: 'Validation Error',
        fallbackMessage: message,
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleNetworkError,
    handleFormError,
  };
};
