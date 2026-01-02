/**
 * Features Layer (Public API)
 * FSD Layer: Features (5)
 * Pattern: MVVM
 *
 * Contains user interactions and actions.
 * Features are "verbs" - actions users can perform.
 *
 * MVVM Structure:
 * - View (ui/): Dumb components, JSX only
 * - ViewModel (model/use*ViewModel): Business logic hooks
 * - Model (model/ + api/): Data types, schemas, and API calls
 *
 * Dependencies: Entities, Shared
 */

// Auth Features - Sign In
export {
  SignInForm,
  useSignInViewModel,
  signInSchema,
  useSignInMutation,
} from './auth/sign-in-by-email';
export type {
  SignInFormData,
  SignInViewModelReturn,
} from './auth/sign-in-by-email';

// Auth Features - Sign Up
export {
  SignUpForm,
  useSignUpViewModel,
  signUpSchema,
  useSignUpMutation,
} from './auth/sign-up-by-email';
export type {
  SignUpFormData,
  SignUpViewModelReturn,
} from './auth/sign-up-by-email';

// Auth Features - Sign Out
export { SignOutButton } from './auth/sign-out';
export type { SignOutButtonProps } from './auth/sign-out';

// Posts Features
export {
  PostItem,
  PostList,
  usePostListViewModel,
  usePostsQuery,
  postsKeys,
} from './posts/list-posts';
export type {
  Post,
  PostItemProps,
  PostListProps,
  PostListViewModelReturn,
} from './posts/list-posts';
