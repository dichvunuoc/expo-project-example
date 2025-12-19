import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function SignUpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Stack.Screen options={{ title: 'Sign Up', headerShown: true }} />
      <Text className="dark:text-white text-lg">
        Sign Up Screen (Not Implemented)
      </Text>
    </View>
  );
}
