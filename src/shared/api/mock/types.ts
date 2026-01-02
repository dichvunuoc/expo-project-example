/**
 * Mock API Types
 * FSD Layer: Shared
 *
 * Shared types for mock API system
 */

import type { AxiosRequestConfig } from 'axios';

/**
 * Mock API Response
 */
export interface MockResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Mock API Error
 */
export interface MockError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * HTTP Method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Route Match Definition
 */
export interface RouteMatch {
  pattern: RegExp;
  method: HttpMethod;
  handler: (
    config: AxiosRequestConfig,
    params?: Record<string, string>
  ) => Promise<MockResponse>;
}
