/**
 * Sign In By Email Feature (Public API)
 * FSD Layer: Features
 *
 * Provides email/password authentication functionality.
 */

// UI
export { SignInForm } from './ui';

// Model
export { signInSchema, type SignInFormData } from './model';

// API
export { useSignInMutation, signInUser } from './api';
