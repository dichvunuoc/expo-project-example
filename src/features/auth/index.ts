/**
 * Auth feature barrel export
 * Provides a single entry point for all auth-related functionality
 */

// API functions
export {
  loginUser,
  registerUser,
  refreshToken,
  resetPassword,
  changePassword,
  getCurrentUser,
  logout,
} from './api';

// Hooks
export { useLogin } from './hooks/useLogin';
export { useAuth } from './hooks/useAuth';

// Store
export { useAuthStore } from './store';

// Types
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
  ResetPasswordData,
  ChangePasswordData,
} from './types';

// Schemas
export { loginSchema, type LoginFormData } from './schemas/auth.schema';
