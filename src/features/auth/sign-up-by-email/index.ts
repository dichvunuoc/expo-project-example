/**
 * Sign Up By Email Feature (Public API)
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * Provides email/password registration functionality.
 *
 * MVVM Structure:
 * - View: SignUpForm (ui/) - Dumb component, JSX only
 * - ViewModel: useSignUpViewModel (model/) - Business logic hook
 * - Model: signUpSchema, useSignUpMutation (model/, api/) - Data & API
 */

// UI (View)
export { SignUpForm } from './ui';

// Model (ViewModel + Schema)
export {
  useSignUpViewModel,
  type SignUpViewModelReturn,
  signUpSchema,
  type SignUpFormData,
} from './model';

// API (Model - Data Layer)
export { useSignUpMutation, signUpUser } from './api';
