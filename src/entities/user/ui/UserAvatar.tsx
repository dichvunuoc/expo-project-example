/**
 * UserAvatar Component
 * FSD Layer: Entities
 *
 * Presentation component for displaying user avatar
 */

import { View, Image, Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib';

const avatarVariants = cva(
  'items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 rounded-full',
        md: 'w-12 h-12 rounded-full',
        lg: 'w-20 h-20 rounded-full',
        xl: 'w-32 h-32 rounded-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const textVariants = cva('font-bold text-gray-600 dark:text-gray-300', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-base',
      lg: 'text-2xl',
      xl: 'text-4xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  name?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  const initials = name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <View className={cn(avatarVariants({ size }), className)}>
        <Image
          source={{ uri: avatarUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View className={cn(avatarVariants({ size }), className)}>
      <Text className={textVariants({ size })}>{initials || '👤'}</Text>
    </View>
  );
}
