/**
 * Posts Mock Routes
 * FSD Layer: Shared
 * Feature: Posts
 *
 * Route definitions for posts endpoints
 */

import type { RouteMatch } from '../../types';
import { handleGetPosts, handleGetPost } from './handlers';

/**
 * Posts routes configuration
 */
export const postsRoutes: RouteMatch[] = [
  {
    pattern: /^\/posts$/,
    method: 'GET',
    handler: async () => handleGetPosts(),
  },
  {
    pattern: /^\/posts\/(?<id>\d+)$/,
    method: 'GET',
    handler: async (_, params) => handleGetPost(Number(params?.id)),
  },
];
