/**
 * Error handling utilities and classes
 * FSD Layer: Shared
 */

/**
 * Type definitions for error details
 */
export interface ErrorDetails {
  originalError?: Error;
  validationErrors?: Record<string, string[]>;
  requestId?: string;
  timestamp?: string;
  shouldLogout?: boolean;
  [key: string]: unknown;
}

/**
 * Axios-like error structure for type checking
 */
interface AxiosLikeError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
  };
  code?: string;
}

/**
 * Fetch-like error structure for type checking
 */
interface FetchLikeError extends Error {
  status?: number;
}

/**
 * Custom API Error class for standardized error handling
 */
export class APIError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public details?: ErrorDetails;
  public readonly timestamp: string;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  getUserMessage(): string {
    switch (this.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authenticated. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'There is a conflict with the current state. Please refresh and try again.';
      case 422:
        return 'The provided data is invalid. Please check the form and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.status === 0;
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Network Error class for network-related issues
 */
export class NetworkError extends APIError {
  constructor(
    message: string = 'Network connection error',
    details?: ErrorDetails
  ) {
    super(message, 0, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

/**
 * Validation Error class for form validation errors
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error class for auth-related errors
 */
export class AuthenticationError extends APIError {
  constructor(
    message: string = 'Authentication failed',
    details?: ErrorDetails
  ) {
    super(message, 401, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class for permission-related errors
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error class for missing resources
 */
export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found', details?: ErrorDetails) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit Error class for rate limiting
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', details?: ErrorDetails) {
    super(message, 429, 'RATE_LIMIT', details);
    this.name = 'RateLimitError';
  }
}

/**
 * Server Error class for server-side errors
 */
export class ServerError extends APIError {
  constructor(
    message: string = 'Internal server error',
    details?: ErrorDetails
  ) {
    super(message, 500, 'SERVER_ERROR', details);
    this.name = 'ServerError';
  }
}

/**
 * Type guard for Axios-like errors
 */
function isAxiosLikeError(error: Error): error is AxiosLikeError {
  return (
    'response' in error &&
    typeof (error as AxiosLikeError).response === 'object'
  );
}

/**
 * Type guard for Fetch-like errors
 */
function isFetchLikeError(error: Error): error is FetchLikeError {
  return (
    'status' in error && typeof (error as FetchLikeError).status === 'number'
  );
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  static handle(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.message.includes('Network request failed')) {
        return new NetworkError(error.message, { originalError: error });
      }

      if (error.message.includes('timeout')) {
        return new NetworkError(
          'Request timeout. Please check your connection and try again.',
          { originalError: error }
        );
      }

      if (isAxiosLikeError(error)) {
        const status = error.response?.status || 500;
        const message =
          error.response?.data?.message || error.message || 'Request failed';
        const code = error.code;

        return new APIError(message, status, code, {
          originalError: error,
          ...error.response?.data,
        });
      }

      if (isFetchLikeError(error)) {
        const status = error.status || 500;
        const message = error.message || 'Request failed';

        return new APIError(message, status, undefined, {
          originalError: error,
        });
      }

      return new APIError(error.message, 500, 'UNKNOWN_ERROR', {
        originalError: error,
      });
    }

    if (typeof error === 'string') {
      return new APIError(error, 500, 'STRING_ERROR');
    }

    return new APIError('Unknown error occurred', 500, 'UNKNOWN_ERROR', {});
  }

  static log(error: APIError, context?: string): void {
    const logData = {
      error: error.toJSON(),
      context,
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.error('[ErrorHandler]', logData);
    }
  }

  static getUserMessage(error: unknown): string {
    const apiError = this.handle(error);
    return apiError.getUserMessage();
  }

  static shouldRetry(error: unknown): boolean {
    const apiError = this.handle(error);
    return (
      apiError.isNetworkError() ||
      apiError.isServerError() ||
      apiError.code === 'TIMEOUT' ||
      apiError.code === 'ECONNRESET'
    );
  }

  static shouldLogout(error: unknown): boolean {
    const apiError = this.handle(error);
    return apiError.isAuthError();
  }

  static createErrorResponse(error: APIError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
        timestamp: error.timestamp,
      },
    };
  }
}

/**
 * Async error handling utility
 */
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  onError?: (error: APIError) => void
): Promise<{ data?: T; error?: APIError }> => {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    const apiError = ErrorHandler.handle(error);
    ErrorHandler.log(apiError);

    if (onError) {
      onError(apiError);
    }

    return { error: apiError };
  }
};
