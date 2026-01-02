/**
 * SignInPage
 * FSD Layer: Pages
 *
 * Sign in screen with authentication form
 */

import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SignInForm } from '@/features';

export function SignInPage() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Stack.Screen options={{ title: 'Sign In' }} />
      <SignInForm />
    </View>
  );
}
