import { Text, View } from 'react-native';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  return (
    <View className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <Text className="text-lg font-bold mb-2 dark:text-white capitalize">
        {post.title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-300">{post.body}</Text>
    </View>
  );
}
