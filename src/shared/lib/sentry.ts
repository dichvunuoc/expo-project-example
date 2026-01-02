import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Safely create routing instrumentation if available
// ReactNavigationInstrumentation might not be available in all Sentry versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let routingInstrumentation: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ReactNavigationInstrumentation = (Sentry as any)
    .ReactNavigationInstrumentation;
  if (ReactNavigationInstrumentation) {
    routingInstrumentation = new ReactNavigationInstrumentation();
  }
} catch (error) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Sentry] ReactNavigationInstrumentation not available:',
      error
    );
  }
}

export { routingInstrumentation };

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!dsn) {
    if (!isDev) {
      // eslint-disable-next-line no-console
      console.warn('Sentry DSN is missing in production environment');
    }
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const integrations: any[] = [];

  // Only add ReactNativeTracing if available and routingInstrumentation was created
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ReactNativeTracing = (Sentry as any).ReactNativeTracing;
    if (ReactNativeTracing && routingInstrumentation) {
      integrations.push(
        new ReactNativeTracing({
          routingInstrumentation,
          enableNativeFramesTracking: !Constants.appOwnership,
        })
      );
    }
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[Sentry] ReactNativeTracing not available:', error);
    }
  }

  Sentry.init({
    dsn,
    debug: isDev,
    tracesSampleRate: 1.0,
    integrations,
  });
}
