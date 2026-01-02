/**
 * Root Layout (Expo Router)
 * FSD Pattern: Proxy Pattern - This file only handles routing configuration
 * All providers and logic are in src/app layer
 */

import '@/core/styles/global.css';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ErrorBoundary, QueryProvider, ThemeProvider } from '@/core';
import { useSessionStore } from '@/entities/session';
import { initSentry, routingInstrumentation } from '@/shared/lib/sentry';
import { NetworkStatusIndicator } from '@/widgets';

SplashScreen.preventAutoHideAsync();

// Initialize Sentry
initSentry();

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref && routingInstrumentation) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('@assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isHydrated, hydrate } = useSessionStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <NetworkStatusIndicator />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
