/**
 * PostItem Component
 * FSD Layer: Features
 */

import { View } from 'react-native';
import { Card, Text } from '@/shared/ui';
import type { Post } from '../model/types';

export interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  return (
    <Card className="mb-4">
      <Text size="lg" weight="bold" className="mb-2 capitalize">
        {post.title}
      </Text>
      <Text variant="muted">{post.body}</Text>
    </Card>
  );
}
