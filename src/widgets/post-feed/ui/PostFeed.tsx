/**
 * PostFeed Widget
 * FSD Layer: Widgets
 *
 * Composes the post list with query logic
 */

import { PostList, usePostsQuery } from '@/features';

export function PostFeed() {
  const {
    data: posts,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = usePostsQuery();

  return (
    <PostList
      posts={posts}
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      onRefresh={refetch}
    />
  );
}
