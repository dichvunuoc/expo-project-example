/**
 * API Client Configuration
 * FSD Layer: Shared
 */

import { Platform } from 'react-native';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ErrorHandler, NetworkError } from './error-handler';

// Type for token getter function (injected from session entity)
type TokenGetter = () => string | null;
type LogoutHandler = () => void;

let getToken: TokenGetter = () => null;
let handleLogout: LogoutHandler = () => {};

/**
 * Configure auth handlers for the API client
 * This allows the session entity to inject its token getter
 */
export const configureAuth = (
  tokenGetter: TokenGetter,
  logoutHandler: LogoutHandler
) => {
  getToken = tokenGetter;
  handleLogout = logoutHandler;
};

/**
 * Get API base URL from environment
 */
const getApiBaseURL = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    return 'http://localhost:3000/api';
  }

  return 'https://api.staging.example.com';
};

/**
 * Create Axios instance
 */
export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    'X-Platform': Platform.OS,
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestId = Math.random().toString(36).substring(2, 15);
    config.headers['X-Request-ID'] = requestId;

    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
      });
    }

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
    if (__DEV__) {
      const requestId = response.config.headers['X-Request-ID'];
      console.log(
        `[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        { requestId }
      );
    }

    return {
      ...response,
      meta: {
        requestId: response.config.headers['X-Request-ID'],
        timestamp: new Date().toISOString(),
      },
    };
  },
  (error: AxiosError) => {
    const requestId = error.config?.headers?.['X-Request-ID'];

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

    if (error.response?.status === 401) {
      if (getToken()) {
        if (__DEV__) {
          console.warn('[API] Auto logout due to 401 response');
        }
        handleLogout();
      }
    }

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
export const post = async <T, D = Record<string, unknown>>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.post(url, data, config));
};

/**
 * PUT request wrapper
 */
export const put = async <T, D = Record<string, unknown>>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiCall<T>(() => apiClient.put(url, data, config));
};

/**
 * PATCH request wrapper
 */
export const patch = async <T, D = Record<string, unknown>>(
  url: string,
  data?: D,
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
