import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';
import { Text } from '../text';

const badgeVariants = cva('items-center justify-center rounded-full', {
  variants: {
    variant: {
      default: 'bg-gray-100 dark:bg-gray-800',
      primary: 'bg-primary',
      secondary: 'bg-gray-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      outline: 'border border-gray-300 dark:border-gray-600 bg-transparent',
    },
    size: {
      sm: 'px-2 py-0.5',
      md: 'px-2.5 py-1',
      lg: 'px-3 py-1.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const badgeTextVariants = cva('font-medium text-center', {
  variants: {
    variant: {
      default: 'text-gray-700 dark:text-gray-300',
      primary: 'text-white',
      secondary: 'text-white',
      success: 'text-white',
      error: 'text-white',
      warning: 'text-gray-900',
      info: 'text-white',
      outline: 'text-gray-700 dark:text-gray-300',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface BadgeProps
  extends ViewProps, VariantProps<typeof badgeVariants> {
  /**
   * Badge text content
   */
  label: string;
  /**
   * Whether to show as a dot (no text)
   * @default false
   */
  dot?: boolean;
  /**
   * Custom text class name
   */
  textClassName?: string;
}

export function Badge({
  label,
  variant,
  size,
  dot = false,
  className,
  textClassName,
  accessibilityLabel,
  ...props
}: BadgeProps) {
  if (dot) {
    return (
      <View
        className={cn(
          'w-2 h-2 rounded-full',
          variant === 'default' && 'bg-gray-400 dark:bg-gray-600',
          variant === 'primary' && 'bg-primary',
          variant === 'secondary' && 'bg-gray-500',
          variant === 'success' && 'bg-green-500',
          variant === 'error' && 'bg-red-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'outline' &&
            'border border-gray-300 dark:border-gray-600',
          className
        )}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel || `Status: ${label}`}
        {...props}
      />
    );
  }

  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label}
      {...props}
    >
      <Text className={cn(badgeTextVariants({ variant, size }), textClassName)}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Notification badge for showing counts
 */
export interface NotificationBadgeProps extends Omit<
  BadgeProps,
  'label' | 'dot'
> {
  /**
   * Count to display
   */
  count: number;
  /**
   * Maximum count before showing "+"
   * @default 99
   */
  maxCount?: number;
  /**
   * Whether to show when count is 0
   * @default false
   */
  showZero?: boolean;
}

export function NotificationBadge({
  count,
  maxCount = 99,
  showZero = false,
  variant = 'error',
  size = 'sm',
  ...props
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge
      label={displayCount}
      variant={variant}
      size={size}
      accessibilityLabel={`${count} notification${count !== 1 ? 's' : ''}`}
      {...props}
    />
  );
}

/**
 * Status badge with dot indicator
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'dot'> {
  /**
   * Whether to show dot indicator
   * @default true
   */
  showDot?: boolean;
}

export function StatusBadge({
  label,
  showDot = true,
  variant = 'success',
  size,
  className,
  textClassName,
  ...props
}: StatusBadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center space-x-1.5',
        badgeVariants({ variant: 'outline', size }),
        className
      )}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
      {...props}
    >
      {showDot && (
        <View
          className={cn(
            'w-2 h-2 rounded-full',
            variant === 'success' && 'bg-green-500',
            variant === 'error' && 'bg-red-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'primary' && 'bg-primary',
            variant === 'secondary' && 'bg-gray-500',
            (variant === 'default' || variant === 'outline') &&
              'bg-gray-400 dark:bg-gray-600'
          )}
        />
      )}
      <Text
        className={cn(
          'text-gray-700 dark:text-gray-300',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          textClassName
        )}
      >
        {label}
      </Text>
    </View>
  );
}
