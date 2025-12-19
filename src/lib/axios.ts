import { useAuthStore } from '@/features/auth/store';
import { ErrorHandler, NetworkError } from './error-handler';
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    if (__DEV__) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error: AxiosError) => {
    const apiError = ErrorHandler.handle(error);
    ErrorHandler.log(apiError, 'Request Interceptor');
    return Promise.reject(apiError);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response && !error.request) {
      const networkError = new NetworkError(
        'Network connection error. Please check your internet connection and try again.',
        { originalError: error }
      );
      ErrorHandler.log(networkError, 'Network Error');
      return Promise.reject(networkError);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new NetworkError(
        'Request timeout. Please check your connection and try again.',
        { originalError: error }
      );
      ErrorHandler.log(timeoutError, 'Timeout Error');
      return Promise.reject(timeoutError);
    }

    // Handle auth errors
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }

    // Convert to APIError
    const apiError = ErrorHandler.handle(error);
    ErrorHandler.log(apiError, 'Response Interceptor');
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
