/**
 * Shared Library Utilities (Public API)
 * FSD Layer: Shared
 *
 * This is the public API for shared utilities.
 * All external imports should use this file.
 */

export {
  BiometricService,
  biometricService,
  type BiometricAvailability,
  type BiometricResult,
  type BiometricSecurityLevel,
  type BiometricType,
} from './biometric';
export { cn } from './cn';
export * from './constants';
export * from './hooks';
export {
  api,
  debug,
  error,
  info,
  logger,
  performance,
  session,
  user,
  warn,
} from './logger';
export * from './navigation';
export {
  OfflineQueue,
  offlineQueue,
  processQueue,
  syncWhenOnline,
  type MutationVariables,
  type OfflineMutation,
} from './offline-queue';
export { initSentry, routingInstrumentation } from './sentry';
export {
  AppStorage,
  AuthStorage,
  STORAGE_KEYS,
  storageService,
  type IStorageService,
} from './storage';
export {
  isValidCreditCard,
  isValidDate,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidURL,
  isValidUsername,
  validateField,
  type ValidationResult,
} from './validation';
