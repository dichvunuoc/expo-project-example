/**
 * PostList Component
 * FSD Layer: Features
 */

import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text } from '@/shared/ui';
import { PostItem } from './PostItem';
import type { Post } from '../model/types';

export interface PostListProps {
  posts?: Post[];
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
  isRefetching?: boolean;
}

export function PostList({
  posts,
  isLoading,
  isError,
  onRefresh,
  isRefetching,
}: PostListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-10">
        <ActivityIndicator size="large" className="text-primary" />
        <Text variant="muted" className="mt-4">
          Loading posts...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-10">
        <Text variant="destructive" weight="bold">
          Failed to load posts
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PostItem post={item} />}
      contentContainerClassName="p-5 pb-20"
      showsVerticalScrollIndicator={false}
      refreshing={isRefetching}
      onRefresh={onRefresh}
      ListHeaderComponent={
        <Text size="2xl" weight="bold" className="mb-5">
          Demo Feed
        </Text>
      }
    />
  );
}
