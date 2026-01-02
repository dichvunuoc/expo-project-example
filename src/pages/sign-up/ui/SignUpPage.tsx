/**
 * SignUpPage
 * FSD Layer: Pages
 *
 * Sign up screen with registration form
 */

import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SignUpForm } from '@/features';

export function SignUpPage() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <SignUpForm />
    </View>
  );
}
