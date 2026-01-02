/**
 * ProfilePage
 * FSD Layer: Pages
 *
 * User profile screen with account information
 */

import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui';
import { UserCard } from '@/entities/user';
import { useSessionStore } from '@/entities/session';
import { SignOutButton } from '@/features';

export function ProfilePage() {
  const user = useSessionStore((state) => state.user);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center p-5">
      <Text size="2xl" weight="bold" className="mb-4">
        Profile
      </Text>

      {user ? (
        <UserCard user={user} className="w-full max-w-sm mb-8" />
      ) : (
        <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm mb-8 items-center border border-gray-100 dark:border-gray-700">
          <View className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 items-center justify-center">
            <Text size="2xl">👤</Text>
          </View>
          <Text size="xl" weight="semibold">
            Guest
          </Text>
        </View>
      )}

      <SignOutButton className="w-full max-w-sm" />
    </SafeAreaView>
  );
}
