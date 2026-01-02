/**
 * Auth Mock Handlers
 * FSD Layer: Shared
 * Feature: Auth
 *
 * Handlers for authentication endpoints
 */

import type { AuthResponse, LoginCredentials } from '@/entities/session';
import type { User } from '@/entities/user';
import {
  MOCK_DELAY,
  logMockRequest,
  logMockResponse,
  simulateDelay,
} from '../../config';
import {
  createMockUser,
  generateMockToken,
  isEmailRegistered,
  sanitizeUser,
  validateCredentials,
} from '../../data';
import type { MockError, MockResponse } from '../../types';

/**
 * Register Data Interface
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * POST /auth/login
 * Handles user login
 */
export const handleLogin = async (
  data: LoginCredentials
): Promise<MockResponse<AuthResponse>> => {
  // Validate input data
  if (!data || !data.email || !data.password) {
    const error: MockError = {
      status: 422,
      message: 'Email and password are required',
      code: 'VALIDATION_ERROR',
      details: {
        missingFields: [
          !data?.email && 'email',
          !data?.password && 'password',
        ].filter(Boolean),
      },
    };
    logMockResponse('POST', '/auth/login', 422);
    throw error;
  }

  logMockRequest('POST', '/auth/login', { email: data.email });

  await simulateDelay(MOCK_DELAY.AUTH);

  const user = validateCredentials(data.email, data.password);

  if (!user) {
    const error: MockError = {
      status: 401,
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    };
    logMockResponse('POST', '/auth/login', 401);
    throw error;
  }

  const response: MockResponse<AuthResponse> = {
    data: {
      token: generateMockToken(user.id),
      user: sanitizeUser(user),
    },
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('POST', '/auth/login', 200, { userId: user.id });
  return response;
};

/**
 * POST /auth/register
 * Handles user registration
 */
export const handleRegister = async (
  data: RegisterData
): Promise<MockResponse<AuthResponse>> => {
  logMockRequest('POST', '/auth/register', {
    email: data.email,
    name: data.name,
  });

  await simulateDelay(MOCK_DELAY.AUTH);

  // Check if email already exists
  if (isEmailRegistered(data.email)) {
    const error: MockError = {
      status: 409,
      message: 'Email already registered',
      code: 'EMAIL_EXISTS',
      details: {
        field: 'email',
        value: data.email,
      },
    };
    logMockResponse('POST', '/auth/register', 409);
    throw error;
  }

  // Create new user
  const newUser = createMockUser(data.name, data.email, data.password);

  const response: MockResponse<AuthResponse> = {
    data: {
      token: generateMockToken(newUser.id),
      user: sanitizeUser(newUser),
    },
    status: 201,
    statusText: 'Created',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('POST', '/auth/register', 201, { userId: newUser.id });
  return response;
};

/**
 * GET /auth/me
 * Get current user profile
 */
export const handleGetMe = async (
  token: string | null
): Promise<MockResponse<User>> => {
  logMockRequest('GET', '/auth/me');

  await simulateDelay(MOCK_DELAY.DETAIL);

  if (!token) {
    const error: MockError = {
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    };
    logMockResponse('GET', '/auth/me', 401);
    throw error;
  }

  // In real app, decode token to get user ID
  // For mock, we return first user
  const user = sanitizeUser(validateCredentials('john@example.com', '123456')!);

  const response: MockResponse<User> = {
    data: user,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('GET', '/auth/me', 200);
  return response;
};

/**
 * POST /auth/logout
 * Logout user
 */
export const handleLogout = async (): Promise<
  MockResponse<{ success: boolean }>
> => {
  logMockRequest('POST', '/auth/logout');

  await simulateDelay(MOCK_DELAY.AUTH);

  const response: MockResponse<{ success: boolean }> = {
    data: { success: true },
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('POST', '/auth/logout', 200);
  return response;
};
