/**
 * Sign Up By Email Feature (Public API)
 * FSD Layer: Features
 *
 * Provides email/password registration functionality.
 */

// UI
export { SignUpForm } from './ui';

// Model
export { signUpSchema, type SignUpFormData } from './model';

// API
export { useSignUpMutation, signUpUser } from './api';
