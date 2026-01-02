/**
 * UserCard Component
 * FSD Layer: Entities
 *
 * Presentation component for displaying user information in a card
 */

import { View } from 'react-native';
import { Card, Text } from '@/shared/ui';
import { UserAvatar } from './UserAvatar';
import type { User } from '../model/types';

export interface UserCardProps {
  user: User;
  className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
  return (
    <Card className={className}>
      <View className="items-center">
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatar}
          size="lg"
          className="mb-4"
        />
        <Text size="xl" weight="semibold" className="mb-1">
          {user.name}
        </Text>
        <Text variant="muted">{user.email}</Text>
      </View>
    </Card>
  );
}
