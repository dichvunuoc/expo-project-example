import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Use any to bypass TypeScript error if types are missing in the installed version
// but functionality exists at runtime.
export const routingInstrumentation = new (
  Sentry as any
).ReactNavigationInstrumentation();

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!dsn) {
    if (!isDev) {
      console.warn('Sentry DSN is missing in production environment');
    }
    return;
  }

  Sentry.init({
    dsn,
    debug: isDev,
    tracesSampleRate: 1.0,
    integrations: [
      new (Sentry as any).ReactNativeTracing({
        routingInstrumentation,
        enableNativeFramesTracking: !Constants.appOwnership,
      }),
    ],
  });
}
