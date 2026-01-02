/**
 * Posts Mock Handlers
 * FSD Layer: Shared
 * Feature: Posts
 *
 * Handlers for posts endpoints
 */

import {
  MOCK_DELAY,
  logMockRequest,
  logMockResponse,
  simulateDelay,
} from '../../config';
import { getAllPosts, getPostById, type MockPost } from '../../data';
import type { MockError, MockResponse } from '../../types';

/**
 * GET /posts
 * Get all posts
 */
export const handleGetPosts = async (): Promise<MockResponse<MockPost[]>> => {
  logMockRequest('GET', '/posts');

  await simulateDelay(MOCK_DELAY.LIST);

  const posts = getAllPosts();

  const response: MockResponse<MockPost[]> = {
    data: posts,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('GET', '/posts', 200, { count: posts.length });
  return response;
};

/**
 * GET /posts/:id
 * Get single post
 */
export const handleGetPost = async (
  id: number
): Promise<MockResponse<MockPost>> => {
  logMockRequest('GET', `/posts/${id}`);

  await simulateDelay(MOCK_DELAY.DETAIL);

  const post = getPostById(id);

  if (!post) {
    const error: MockError = {
      status: 404,
      message: 'Post not found',
      code: 'NOT_FOUND',
    };
    logMockResponse('GET', `/posts/${id}`, 404);
    throw error;
  }

  const response: MockResponse<MockPost> = {
    data: post,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  };

  logMockResponse('GET', `/posts/${id}`, 200);
  return response;
};
