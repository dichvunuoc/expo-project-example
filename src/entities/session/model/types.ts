/**
 * Session Entity Types
 * FSD Layer: Entities
 */

import type { User } from '@/entities/user';

export interface Session {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
  phone?: string;
  avatar?: string;
}
