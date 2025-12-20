import { initSentry, routingInstrumentation } from '@/lib/sentry';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthStore } from '@/features/auth/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { queryClient } from '@/lib/query-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

/**
 * Network status indicator component
 */
function NetworkStatusIndicator() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  // Only show when offline (optional - can be removed if not needed)
  if (isConnected && isInternetReachable) {
    return null;
  }

  return (
    <View
      className="absolute left-0 right-0 z-50 items-center bg-[#ff6b6b] p-2"
      style={{ top: insets.top }}
    >
      <Text className="text-white text-xs font-bold">
        {isConnected && !isInternetReachable
          ? 'No Internet Connection'
          : 'Offline Mode - Data will sync when online'}
      </Text>
    </View>
  );
}

// Initialize Sentry
initSentry();

function RootLayout() {
  usePushNotifications();
  const colorScheme = useColorScheme();

  // Capture the navigation container ref for Sentry
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  // Initialize network status monitoring
  useNetworkStatus();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();

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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <NetworkStatusIndicator />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
