/**
 * Mock Axios Adapter
 * FSD Layer: Shared
 *
 * Intercepts axios requests and returns mock responses
 * when mock mode is enabled.
 */

import axios, {
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { isMockEnabled } from './config';
import { registerAllRoutes } from './core/register-routes';
import { matchRoute } from './core/router';
import type { MockError } from './types';

/**
 * Create a mock axios adapter
 * This adapter intercepts all requests and returns mock responses
 */
export const createMockAdapter = (
  originalAdapter: AxiosAdapter
): AxiosAdapter => {
  return async (config: InternalAxiosRequestConfig) => {
    // If mock is disabled, use original adapter
    if (!isMockEnabled()) {
      return originalAdapter(config);
    }

    const method = config.method?.toUpperCase() || 'GET';
    let url = config.url || '';

    // Remove baseURL from URL if present
    // axios combines baseURL + url, but our route matchers expect just the path
    if (config.baseURL && url.startsWith(config.baseURL)) {
      url = url.replace(config.baseURL, '');
    }
    // Ensure URL starts with /
    if (url && !url.startsWith('/')) {
      url = `/${url}`;
    }

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[MOCK API] Intercepting ${method} ${url}`, {
        originalUrl: config.url,
        baseURL: config.baseURL,
        normalizedUrl: url,
        requestData: config.data,
        dataType: typeof config.data,
        dataKeys:
          config.data && typeof config.data === 'object'
            ? Object.keys(config.data)
            : null,
      });
    }

    // Try to match route
    const match = matchRoute(method, url);

    // If no mock handler found, pass to original adapter
    if (!match) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          `[MOCK API] No handler for ${method} ${url}, passing to real API`
        );
      }
      return originalAdapter(config);
    }

    try {
      // Parse data if it's a string (axios may serialize it)
      let parsedData = config.data;
      if (typeof config.data === 'string') {
        try {
          parsedData = JSON.parse(config.data);
        } catch (parseError) {
          // If parsing fails, use original data
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(
              '[MOCK API] Failed to parse data as JSON, using original:',
              parseError
            );
          }
        }
      }

      // Create config with parsed data
      const configWithParsedData = {
        ...config,
        data: parsedData,
      };

      // Call mock handler
      const response = await match.handler(configWithParsedData, match.params);

      // Return axios-compatible response
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
      };
    } catch (error) {
      // Handle mock errors
      let mockError: MockError;

      // Check if error is already a MockError
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        'message' in error
      ) {
        mockError = error as MockError;
      } else {
        // Wrap unexpected errors
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Internal server error in mock handler';

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('[MOCK API] Unexpected error in handler:', error);
        }

        mockError = {
          status: 500,
          message: errorMessage,
          code: 'MOCK_HANDLER_ERROR',
          details: {
            originalError: error instanceof Error ? error.stack : String(error),
          },
        };
      }

      // Ensure we have valid status and message
      const status = mockError.status || 500;
      const message = mockError.message || 'Unknown error occurred';

      // Create axios-like error response
      const axiosError = {
        response: {
          data: {
            message,
            code: mockError.code || 'UNKNOWN_ERROR',
            details: mockError.details,
          },
          status,
          statusText: getStatusText(status),
          headers: { 'content-type': 'application/json' },
          config,
        },
        config,
        isAxiosError: true,
        message,
        name: 'AxiosError',
        code: mockError.code || 'UNKNOWN_ERROR',
      };

      throw axiosError;
    }
  };
};

/**
 * Get HTTP status text from status code
 */
const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
};

/**
 * Get the default adapter that axios would use
 * This handles the case where defaults.adapter is undefined
 */
const getDefaultAdapter = (): AxiosAdapter => {
  // Use axios's default adapter resolution
  // In React Native, this will be the XHR adapter
  // axios.getAdapter takes the adapters config (which can be undefined for defaults)
  return axios.getAdapter(axios.defaults.adapter);
};

/**
 * Setup mock adapter on axios instance
 */
export const setupMockAdapter = (axiosInstance: {
  defaults: {
    adapter?: AxiosAdapter | string | (AxiosAdapter | string)[];
  };
}): void => {
  if (!isMockEnabled()) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[MOCK API] Mock mode disabled');
    }
    return;
  }

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[MOCK API] Mock mode ENABLED - API calls will be mocked');
  }

  // Register all routes from all features
  registerAllRoutes();

  // Get the original adapter (or use axios default)
  let originalAdapter: AxiosAdapter;

  if (
    axiosInstance.defaults.adapter &&
    typeof axiosInstance.defaults.adapter === 'function'
  ) {
    originalAdapter = axiosInstance.defaults.adapter as AxiosAdapter;
  } else {
    // Use axios's default adapter (will resolve to XHR adapter in React Native)
    originalAdapter = getDefaultAdapter();
  }

  // Wrap the original adapter with our mock adapter
  axiosInstance.defaults.adapter = createMockAdapter(originalAdapter);
};
