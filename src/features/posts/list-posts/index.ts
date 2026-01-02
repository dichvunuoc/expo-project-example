/**
 * List Posts Feature (Public API)
 * FSD Layer: Features
 */

// UI
export { PostItem, PostList } from './ui';
export type { PostItemProps, PostListProps } from './ui';

// Model
export type { Post } from './model';

// API
export { usePostsQuery, postsKeys } from './api';
