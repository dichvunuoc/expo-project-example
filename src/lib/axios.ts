import { Platform } from 'react-native';
import { useAuthStore } from '@/features/auth/store';
import { ErrorHandler, NetworkError } from './error-handler';
import { api as logger } from '@/utils/logger';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Get API URL from environment variables
const getApiBaseURL = (): string => {
  // Priority: Environment variable > Default staging > Default local
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    return 'http://localhost:3000/api'; // Local development
  }

  return 'https://api.staging.example.com'; // Default staging
};

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    'X-Platform': Platform.OS, // Add platform info for debugging
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get current token from Zustand store
    const token = useAuthStore.getState().token;

    // Add authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    const requestId = Math.random().toString(36).substring(2, 15);
    config.headers['X-Request-ID'] = requestId;

    // Log request using logger utility
    logger.request(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || 'unknown',
      {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        params: config.params,
        data: config.data,
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer [REDACTED]' : undefined,
        },
      },
      requestId
    );

    return config;
  },
  (error: AxiosError) => {
    const apiError = ErrorHandler.handle(error);
    ErrorHandler.log(apiError, 'Request Interceptor Error');
    return Promise.reject(apiError);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response using logger utility
    const requestId = response.config.headers['X-Request-ID'];
    logger.response(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || 'unknown',
      response.status,
      {
        status: response.status,
        statusText: response.statusText,
        duration: response.headers['X-Response-Time'],
        data: response.data,
        requestId,
      },
      requestId
    );

    // Return response with additional metadata
    return {
      ...response,
      meta: {
        requestId: response.config.headers['X-Request-ID'],
        timestamp: new Date().toISOString(),
      },
    };
  },
  (error: AxiosError) => {
    // Get request ID for logging
    const requestId = error.config?.headers?.['X-Request-ID'];

    // Handle network errors (no response received)
    if (!error.response && !error.request) {
      const networkError = new NetworkError(
        'Network connection error. Please check your internet connection and try again.',
        {
          originalError: error,
          requestId,
          timestamp: new Date().toISOString(),
        }
      );
      ErrorHandler.log(networkError, 'Network Error');
      return Promise.reject(networkError);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new NetworkError(
        'Request timeout. The server took too long to respond. Please try again.',
        {
          originalError: error,
          requestId,
          timeout: error.config?.timeout,
        }
      );
      ErrorHandler.log(timeoutError, 'Timeout Error');
      return Promise.reject(timeoutError);
    }

    // Handle CORS errors
    if (
      error.message.includes('Network Error') &&
      error.response?.status === 0
    ) {
      const corsError = new NetworkError(
        'CORS error. The server is not configured to accept requests from this domain.',
        {
          originalError: error,
          requestId,
        }
      );
      ErrorHandler.log(corsError, 'CORS Error');
      return Promise.reject(corsError);
    }

    // Handle authentication errors (401, 403)
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      const authStore = useAuthStore.getState();
      if (authStore.token) {
        logger.warn(
          'Auto logout due to 401 response',
          {
            reason: 'Authentication failed',
            status: error.response?.status,
            url: error.config?.url,
          },
          {
            component: 'Axios',
            action: 'AUTO_LOGOUT',
          }
        );
        authStore.signOut();
      }
    }

    // Convert to APIError with additional context
    const apiError = ErrorHandler.handle(error);
    if (requestId) {
      apiError.details = {
        ...apiError.details,
        requestId,
      };
    }

    ErrorHandler.log(apiError, 'Response Interceptor Error');
    return Promise.reject(apiError);
  }
);

/**
 * Wrapper for API calls with consistent error handling
 */
export const apiCall = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw ErrorHandler.handle(error);
  }
};

/**
 * GET request wrapper
 */
export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.get(url, config));
};

/**
 * POST request wrapper
 */
export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.post(url, data, config));
};

/**
 * PUT request wrapper
 */
export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.put(url, data, config));
};

/**
 * PATCH request wrapper
 */
export const patch = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.patch(url, data, config));
};

/**
 * DELETE request wrapper
 */
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.delete(url, config));
};

export default apiClient;
