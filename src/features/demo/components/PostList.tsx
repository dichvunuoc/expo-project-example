import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Post } from '../types';
import { PostItem } from './PostItem';

interface PostListProps {
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
        <Text className="mt-4 text-gray-500">Loading posts...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-10">
        <Text className="text-red-500 font-bold">Failed to load posts</Text>
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
        <Text className="text-2xl font-bold mb-5 dark:text-white">
          Demo Feed
        </Text>
      }
    />
  );
}
