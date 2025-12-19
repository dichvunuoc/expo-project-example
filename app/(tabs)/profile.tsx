import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center p-5">
      <Text className="text-2xl font-bold dark:text-white mb-4">Profile</Text>

      <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm mb-8 items-center border border-gray-100 dark:border-gray-700">
        <View className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 items-center justify-center">
          <Text className="text-2xl">👤</Text>
        </View>
        <Text className="text-xl font-semibold dark:text-white">
          {user?.name || 'Guest'}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400">{user?.email}</Text>
      </View>

      <Button
        label="Sign Out"
        variant="outline"
        onPress={signOut}
        className="w-full max-w-sm"
      />
    </SafeAreaView>
  );
}
