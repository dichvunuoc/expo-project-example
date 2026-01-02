/**
 * Features Layer (Public API)
 * FSD Layer: Features (5)
 *
 * Contains user interactions and actions.
 * Features are "verbs" - actions users can perform.
 *
 * Dependencies: Entities, Shared
 */

// Auth Features
export {
  SignInForm,
  signInSchema,
  useSignInMutation,
} from './auth/sign-in-by-email';
export type { SignInFormData } from './auth/sign-in-by-email';

export {
  SignUpForm,
  signUpSchema,
  useSignUpMutation,
} from './auth/sign-up-by-email';
export type { SignUpFormData } from './auth/sign-up-by-email';

export { SignOutButton } from './auth/sign-out';
export type { SignOutButtonProps } from './auth/sign-out';

// Posts Features
export {
  PostItem,
  PostList,
  usePostsQuery,
  postsKeys,
} from './posts/list-posts';
export type { Post, PostItemProps, PostListProps } from './posts/list-posts';
