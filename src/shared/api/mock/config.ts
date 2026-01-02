/**
 * Mock API Configuration
 * FSD Layer: Shared
 *
 * Centralized configuration for mock API system.
 * Enable/disable mock mode via environment variables.
 */

import { debug as logger } from '@/shared/lib/logger';

/**
 * Check if mock mode is enabled
 * Priority: EXPO_PUBLIC_MOCK_API > __DEV__ with no API_URL
 */
export const isMockEnabled = (): boolean => {
  // Explicitly enabled via env
  if (process.env.EXPO_PUBLIC_MOCK_API === 'true') {
    return true;
  }

  // Explicitly disabled
  if (process.env.EXPO_PUBLIC_MOCK_API === 'false') {
    return false;
  }

  // Auto-enable in dev when no API URL is set
  if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
    return true;
  }

  return false;
};

/**
 * Mock response delay configuration (ms)
 * Simulates network latency for realistic testing
 */
export const MOCK_DELAY = {
  MIN: 200,
  MAX: 800,
  AUTH: 500, // Auth requests
  LIST: 300, // List requests
  DETAIL: 200, // Detail requests
  MUTATION: 400, // Create/Update/Delete
} as const;

/**
 * Get random delay within range
 */
export const getRandomDelay = (
  min = MOCK_DELAY.MIN,
  max = MOCK_DELAY.MAX
): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Simulate network delay
 */
export const simulateDelay = (ms?: number): Promise<void> => {
  const delay = ms ?? getRandomDelay();
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Mock error probability (for testing error handling)
 * Set to 0 to disable random errors
 */
export const MOCK_ERROR_RATE = 0; // 0% chance of random error

/**
 * Should simulate random error
 */
export const shouldSimulateError = (): boolean => {
  return Math.random() < MOCK_ERROR_RATE;
};

/**
 * Log mock request (dev only)
 */
export const logMockRequest = (
  method: string,
  url: string,
  data?: unknown
): void => {
  if (__DEV__) {
    logger(`MOCK API Request: ${method} ${url}`, data ? { data } : undefined, {
      component: 'MockAPI',
      action: method.toUpperCase(),
    });
  }
};

/**
 * Log mock response (dev only)
 */
export const logMockResponse = (
  method: string,
  url: string,
  status: number,
  data?: unknown
): void => {
  if (__DEV__) {
    logger(
      `MOCK API Response: ${status} ${method} ${url}`,
      data ? { response: data } : undefined,
      {
        component: 'MockAPI',
        action: method.toUpperCase(),
      }
    );
  }
};
