/**
 * Demo feature barrel export
 * Provides a single entry point for demo-related functionality
 */

// API functions
export { fetchPosts, fetchPostById } from './api';

// Hooks
export { usePosts, usePost } from './hooks/usePosts';

// Types
export type { Post } from './types';
