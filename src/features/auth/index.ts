/**
 * Auth feature barrel export
 * Provides a single entry point for all auth-related functionality
 */

// API functions
export {
  changePassword,
  getCurrentUser,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  resetPassword,
} from './api';

// Note: Old hooks (useLogin, useAuth) have been removed.
// Use ViewModels from sign-in-by-email and sign-up-by-email features instead.

// Store
export { useAuthStore } from './store';

// Types
export type {
  AuthResponse,
  ChangePasswordData,
  LoginCredentials,
  RegisterUserData,
  ResetPasswordData,
  User,
} from './types';

// Note: Schemas are now in individual features (sign-in-by-email, sign-up-by-email)
// Use signInSchema from './sign-in-by-email' or signUpSchema from './sign-up-by-email'
