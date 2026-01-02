/**
 * HomePage
 * FSD Layer: Pages
 *
 * Home screen displaying welcome message
 */

import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui';

export function HomePage() {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <Text size="2xl" weight="bold">
        Home Tab
      </Text>
      <Text variant="muted" className="mt-2">
        Welcome to Expo Enterprise Template
      </Text>
    </SafeAreaView>
  );
}
