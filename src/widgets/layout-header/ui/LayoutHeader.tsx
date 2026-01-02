/**
 * LayoutHeader Widget
 * FSD Layer: Widgets
 *
 * Common header component for page layouts
 */

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Box } from '@/shared/ui';
import { cn } from '@/shared/lib';

export interface LayoutHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  rightAction?: React.ReactNode;
}

export function LayoutHeader({
  title,
  subtitle,
  className,
  rightAction,
}: LayoutHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      variant="default"
      rounded="none"
      padding="md"
      border="default"
      className={cn('border-t-0 border-l-0 border-r-0', className)}
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text size="2xl" weight="bold">
            {title}
          </Text>
          {subtitle && (
            <Text variant="muted" size="sm" className="mt-1">
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </Box>
  );
}
