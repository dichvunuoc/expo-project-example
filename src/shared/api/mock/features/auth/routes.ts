/**
 * Auth Mock Routes
 * FSD Layer: Shared
 * Feature: Auth
 *
 * Route definitions for authentication endpoints
 */

import type { AxiosRequestConfig } from 'axios';
import type { LoginCredentials } from '@/entities/session';
import type { RouteMatch } from '../../types';
import {
  handleLogin,
  handleRegister,
  handleGetMe,
  handleLogout,
  type RegisterData,
} from './handlers';

/**
 * Auth routes configuration
 */
export const authRoutes: RouteMatch[] = [
  {
    pattern: /^\/auth\/login$/,
    method: 'POST',
    handler: async (config: AxiosRequestConfig) =>
      handleLogin(config.data as LoginCredentials),
  },
  {
    pattern: /^\/auth\/register$/,
    method: 'POST',
    handler: async (config: AxiosRequestConfig) =>
      handleRegister(config.data as RegisterData),
  },
  {
    pattern: /^\/auth\/me$/,
    method: 'GET',
    handler: async (config: AxiosRequestConfig) => {
      const token =
        config.headers?.Authorization?.toString().replace('Bearer ', '') ||
        null;
      return handleGetMe(token);
    },
  },
  {
    pattern: /^\/auth\/logout$/,
    method: 'POST',
    handler: async () => handleLogout(),
  },
];
