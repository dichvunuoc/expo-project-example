import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-xl font-bold dark:text-white">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Text className="mt-4 text-base text-blue-500 underline">
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
