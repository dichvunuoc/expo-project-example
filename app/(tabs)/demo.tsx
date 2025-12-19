import { PostList } from '@/features/demo/components/PostList';
import { usePosts } from '@/features/demo/hooks/usePosts';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function DemoScreen() {
  // 1. Logic Layer: Call the hook
  const { data: posts, isLoading, isError, refetch, isRefetching } = usePosts();

  // 2. Presentation Layer: Render the dumb component
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <PostList
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        onRefresh={refetch}
        isRefetching={isRefetching}
      />
    </SafeAreaView>
  );
}
