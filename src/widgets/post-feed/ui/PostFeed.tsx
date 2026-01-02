/**
 * PostFeed Widget (View)
 * FSD Layer: Widgets
 * Pattern: MVVM
 *
 * This widget composes PostList with the ViewModel.
 * All data fetching logic is delegated to usePostListViewModel.
 *
 * MVVM Rules:
 * - NO direct API calls (useQuery, useMutation)
 * - ONLY call ViewModel hook and compose UI components
 */

import { PostList, usePostListViewModel } from '@/features';

export function PostFeed() {
  // ViewModel provides all data and logic
  const { data, actions, state } = usePostListViewModel();

  return (
    <PostList
      posts={data.posts}
      isLoading={state.isLoading}
      isError={state.isError}
      isRefetching={state.isRefetching}
      onRefresh={actions.onRefresh}
    />
  );
}
