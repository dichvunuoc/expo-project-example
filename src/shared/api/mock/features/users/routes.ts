/**
 * Users Mock Routes
 * FSD Layer: Shared
 * Feature: Users
 *
 * Route definitions for users endpoints
 */

import type { RouteMatch } from '../../types';
import { handleGetUser } from './handlers';

/**
 * Users routes configuration
 */
export const usersRoutes: RouteMatch[] = [
  {
    pattern: /^\/users\/(?<id>\w+)$/,
    method: 'GET',
    handler: async (_, params) => handleGetUser(params?.id || ''),
  },
];
