/**
 * Sign In By Email Feature (Public API)
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * Provides email/password authentication functionality.
 *
 * MVVM Structure:
 * - View: SignInForm (ui/) - Dumb component, JSX only
 * - ViewModel: useSignInViewModel (model/) - Business logic hook
 * - Model: signInSchema, useSignInMutation (model/, api/) - Data & API
 */

// UI (View)
export { SignInForm } from './ui';

// Model (ViewModel + Schema)
export {
  useSignInViewModel,
  type SignInViewModelReturn,
  signInSchema,
  type SignInFormData,
} from './model';

// API (Model - Data Layer)
export { useSignInMutation, signInUser } from './api';
