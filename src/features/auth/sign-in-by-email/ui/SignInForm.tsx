/**
 * SignInForm Component (View)
 * FSD Layer: Features
 * Pattern: MVVM
 *
 * This is a "dumb" component that only contains JSX and styles.
 * All business logic is delegated to useSignInViewModel hook.
 *
 * MVVM Rules:
 * - NO useEffect, useState (complex), or direct API calls
 * - ONLY call ViewModel hook and render UI
 * - ONLY handle UI-specific concerns (styling, layout)
 */

import { View } from 'react-native';
import { Link } from 'expo-router';
import { Button, ControlledInput, Text } from '@/shared/ui';
import { useSignInViewModel } from '../model/useSignInViewModel';

export function SignInForm() {
  // ViewModel provides all logic and state
  const { form, actions, state } = useSignInViewModel();

  return (
    <View className="w-full max-w-sm space-y-4">
      <Text size="3xl" weight="bold" className="text-center mb-8">
        Welcome Back
      </Text>

      <View className="space-y-4">
        <ControlledInput
          label="Email"
          placeholder="Enter your email"
          control={form.control}
          name="email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <ControlledInput
          label="Password"
          placeholder="Enter your password"
          control={form.control}
          name="password"
          secureTextEntry
        />
      </View>

      <Button
        label="Sign In"
        onPress={actions.onSubmit}
        isLoading={state.isPending}
        className="mt-6"
      />

      <View className="flex-row justify-center mt-4">
        <Text variant="muted">Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Text variant="primary" weight="semibold">
            Sign Up
          </Text>
        </Link>
      </View>
    </View>
  );
}
