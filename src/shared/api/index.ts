/**
 * Shared API Infrastructure (Public API)
 * FSD Layer: Shared
 *
 * This is the public API for shared API utilities.
 * All external imports should use this file.
 */

export {
  apiClient,
  configureAuth,
  get,
  post,
  put,
  patch,
  del,
  apiCall,
} from './client';

export {
  APIError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ErrorHandler,
  handleAsyncError,
  type ErrorDetails,
} from './error-handler';

export {
  queryClient,
  setupOnlineManager,
  getNetworkStatus,
} from './query-client';
