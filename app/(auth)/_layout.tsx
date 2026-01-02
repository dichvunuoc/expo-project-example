/**
 * Auth Layout (Expo Router)
 * FSD Pattern: Proxy Pattern
 */

import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '@/entities/session';

export default function AuthLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
