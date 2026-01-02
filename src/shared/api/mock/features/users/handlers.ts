/**
 * Users Mock Handlers
 * FSD Layer: Shared
 * Feature: Users
 *
 * Handlers for users endpoints
 */

import type { User } from '@/entities/user';
import {
  MOCK_DELAY,
  logMockRequest,
  logMockResponse,
  simulateDelay,
} from '../../config';
import { findUserById, sanitizeUser } from '../../data';
import type { MockError, MockResponse } from '../../types';

/**
 * GET /users/:id
 * Get user by ID
 */
export const handleGetUser = async (
  id: string
): Promise<MockResponse<User>> => {
  logMockRequest('GET', `/users/${id}`);

  await simulateDelay(MOCK_DELAY.DETAIL);

  const user = findUserById(id);

  if (!user) {
    const error: MockError = {
      status: 404,
      message: 'User not found',
      code: 'NOT_FOUND',
    };
    logMockResponse('GET', `/users/${id}`, 404);
    throw error;
  }

  const response: MockResponse<User> = {
    data: sanitizeUser(user),
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('GET', `/users/${id}`, 200);
  return response;
};
