/**
 * Not Found Screen (Expo Router)
 */

import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/shared/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text size="xl" weight="bold">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Text variant="primary" className="mt-4 underline">
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
