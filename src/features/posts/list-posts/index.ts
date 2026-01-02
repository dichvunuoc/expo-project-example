/**
 * List Posts Feature (Public API)
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * Provides post listing functionality.
 *
 * MVVM Structure:
 * - View: PostList, PostItem (ui/) - Dumb components, JSX only
 * - ViewModel: usePostListViewModel (model/) - Business logic hook
 * - Model: Post types, usePostsQuery (model/, api/) - Data & API
 */

// UI (View)
export { PostItem, PostList } from './ui';
export type { PostItemProps, PostListProps } from './ui';

// Model (ViewModel + Types)
export {
  usePostListViewModel,
  type PostListViewModelReturn,
  type Post,
} from './model';

// API (Model - Data Layer)
export { usePostsQuery, postsKeys } from './api';
