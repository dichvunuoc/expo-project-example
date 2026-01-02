/**
 * Post List ViewModel Hook
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * This ViewModel hook encapsulates all posts listing business logic,
 * data fetching, and state management. The View (PostList)
 * should only call this hook and render JSX.
 */

import { useCallback } from 'react';
import { usePostsQuery } from '../api';
import type { Post } from './types';

/**
 * ViewModel return type interface
 * Clearly defines the contract between View and ViewModel
 */
export interface PostListViewModelReturn {
  /** Data from server */
  data: {
    posts: Post[] | undefined;
  };
  /** Actions exposed to View */
  actions: {
    onRefresh: () => void;
  };
  /** UI state */
  state: {
    isLoading: boolean;
    isError: boolean;
    isRefetching: boolean;
    error: Error | null;
  };
}

/**
 * Post List ViewModel Hook
 *
 * Responsibilities:
 * - Fetch posts from API (TanStack Query)
 * - Manage loading, error, and refetching states
 * - Provide refresh action
 * - Handle data transformation if needed
 *
 * @returns PostListViewModelReturn - Data, actions, and state
 */
export const usePostListViewModel = (): PostListViewModelReturn => {
  // API query hook from Model layer
  const postsQuery = usePostsQuery();

  /**
   * Refresh handler
   * Exposed to View for pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    postsQuery.refetch();
  }, [postsQuery]);

  return {
    data: {
      posts: postsQuery.data,
    },
    actions: {
      onRefresh,
    },
    state: {
      isLoading: postsQuery.isLoading,
      isError: postsQuery.isError,
      isRefetching: postsQuery.isRefetching,
      error: postsQuery.error,
    },
  };
};
