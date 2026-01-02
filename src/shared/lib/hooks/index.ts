/**
 * Hooks barrel export
 * Provides a single entry point for all custom hooks
 */

// Biometric authentication
export {
  useBiometrics,
  useBiometricAuth,
  useBiometricAvailability,
  type UseBiometricsState,
  type UseBiometricsOptions,
} from './useBiometrics';

// Color scheme
export { useColorScheme } from './useColorScheme';

// Error handling
export { useErrorHandler } from './useError';

// Network status
export { useNetworkStatus, useIsOnline } from './useNetworkStatus';

// Offline sync
export { useOfflineSyncManager } from './useOfflineSyncManager';

// Push notifications
export { usePushNotifications } from './usePushNotifications';

// Theme mode
export { useThemeMode } from './useThemeMode';
