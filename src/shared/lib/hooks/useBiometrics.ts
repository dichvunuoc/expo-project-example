import {
  biometricService,
  type BiometricResult,
  type BiometricSecurityLevel,
} from '@/shared/lib/biometric';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

/**
 * Biometric authentication hook state
 */
export interface UseBiometricsState {
  isSupported: boolean;
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
  biometricType: string | null;
  securityLevel: BiometricSecurityLevel | null;
}

/**
 * Biometric authentication hook options
 */
export interface UseBiometricsOptions {
  autoCheck?: boolean; // Automatically check biometric availability on mount
  showErrorAlert?: boolean; // Show error messages in alerts
  customErrorMessage?: string; // Custom error message for failed auth
  onSuccess?: () => void; // Callback for successful authentication
  onError?: (error: string) => void; // Callback for failed authentication
}

/**
 * Hook for biometric authentication
 */
export const useBiometrics = (options: UseBiometricsOptions = {}) => {
  const {
    autoCheck = true,
    showErrorAlert = true,
    customErrorMessage,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseBiometricsState>({
    isSupported: false,
    isEnrolled: false,
    isLoading: true,
    error: null,
    biometricType: null,
    securityLevel: null,
  });

  /**
   * Check biometric availability
   */
  const checkAvailability = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const availability = await biometricService.checkBiometricSupported();
      const primaryType = await biometricService.getPrimaryBiometricType();

      setState((prev) => ({
        ...prev,
        isSupported: availability.supported,
        isEnrolled: availability.enrolled,
        isLoading: false,
        error: null,
        biometricType: primaryType,
        securityLevel: availability.securityLevel,
      }));

      return availability;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check biometric support';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      if (showErrorAlert) {
        Alert.alert('Error', errorMessage);
      }

      return null;
    }
  }, [showErrorAlert]);

  /**
   * Authenticate user with biometrics
   */
  const authenticate = useCallback(
    async (authOptions?: {
      promptMessage?: string;
      fallbackLabel?: string;
      cancelLabel?: string;
    }): Promise<BiometricResult> => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        const result = await biometricService.authenticate({
          promptMessage: authOptions?.promptMessage,
          fallbackLabel: authOptions?.fallbackLabel,
          cancelLabel: authOptions?.cancelLabel,
          requireDeviceUnlock: false,
        });

        if (result.success) {
          onSuccess?.();
        } else {
          const errorMessage =
            result.error || result.warning || 'Authentication failed';

          setState((prev) => ({ ...prev, error: errorMessage }));

          if (showErrorAlert && result.error) {
            Alert.alert(
              'Authentication Failed',
              customErrorMessage || errorMessage
            );
          }

          onError?.(errorMessage);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Authentication failed';

        setState((prev) => ({ ...prev, error: errorMessage }));

        if (showErrorAlert) {
          Alert.alert('Error', customErrorMessage || errorMessage);
        }

        onError?.(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [showErrorAlert, customErrorMessage, onSuccess, onError]
  );

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Check if specific biometric type is available
   */
  const isFaceIdAvailable = useCallback(async () => {
    return await biometricService.isFaceIdAvailable();
  }, []);

  const isFingerprintAvailable = useCallback(async () => {
    return await biometricService.isFingerprintAvailable();
  }, []);

  /**
   * Get appropriate biometric icon
   */
  const getBiometricIcon = useCallback(() => {
    if (!state.biometricType) return 'fingerprint';

    switch (state.biometricType.toLowerCase()) {
      case 'face id':
        return 'face-id';
      case 'fingerprint':
        return 'fingerprint';
      case 'iris scanner':
        return 'eye';
      default:
        return 'fingerprint';
    }
  }, [state.biometricType]);

  /**
   * Get biometric prompt message based on type
   */
  const getPromptMessage = useCallback(
    (action: string = 'continue') => {
      if (!state.biometricType) return `Use biometrics to ${action}`;

      switch (state.biometricType.toLowerCase()) {
        case 'face id':
          return `Use Face ID to ${action}`;
        case 'fingerprint':
          return `Use fingerprint to ${action}`;
        case 'iris scanner':
          return `Use iris scanner to ${action}`;
        default:
          return `Use biometrics to ${action}`;
      }
    },
    [state.biometricType]
  );

  /**
   * Check if biometrics can be used for quick login
   */
  const canUseForLogin = useCallback(() => {
    return state.isSupported && state.isEnrolled && !state.isLoading;
  }, [state]);

  /**
   * Auto-check availability on mount
   */
  useEffect(() => {
    if (autoCheck) {
      checkAvailability();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [autoCheck, checkAvailability]);

  return {
    // State
    ...state,

    // Actions
    checkAvailability,
    authenticate,
    resetError,

    // Helpers
    isFaceIdAvailable,
    isFingerprintAvailable,
    getBiometricIcon,
    getPromptMessage,
    canUseForLogin,

    // Convenience booleans
    isFaceId: state.biometricType?.toLowerCase() === 'face id',
    isFingerprint: state.biometricType?.toLowerCase() === 'fingerprint',
    hasBiometrics: state.isSupported && state.isEnrolled,
    readyToUse: state.isSupported && state.isEnrolled && !state.isLoading,
  };
};

/**
 * Hook for biometric authentication with auto-retry logic
 */
export const useBiometricAuth = (
  onSuccess: () => void,
  options?: Omit<UseBiometricsOptions, 'onSuccess'>
) => {
  const {
    authenticate,
    canUseForLogin,
    getPromptMessage,
    getBiometricIcon,
    hasBiometrics,
    isLoading,
    error,
    ...rest
  } = useBiometrics({
    ...options,
    onSuccess,
  });

  /**
   * Quick authenticate function with default options
   */
  const quickAuth = useCallback(
    async (action: string = 'continue') => {
      if (!canUseForLogin()) {
        return {
          success: false,
          error: 'Biometrics not available or not enrolled',
        };
      }

      return await authenticate({
        promptMessage: getPromptMessage(action),
      });
    },
    [authenticate, canUseForLogin, getPromptMessage]
  );

  return {
    authenticate: quickAuth,
    canUseForLogin,
    getPromptMessage,
    getBiometricIcon,
    hasBiometrics,
    isLoading,
    error,
    ...rest,
  };
};

/**
 * Hook for checking biometric availability only (no auth)
 */
export const useBiometricAvailability = () => {
  const {
    isSupported,
    isEnrolled,
    isLoading,
    error,
    biometricType,
    securityLevel,
    checkAvailability,
    resetError,
    isFaceIdAvailable,
    isFingerprintAvailable,
    hasBiometrics,
    readyToUse,
  } = useBiometrics({
    autoCheck: true,
    showErrorAlert: false,
  });

  return {
    isSupported,
    isEnrolled,
    isLoading,
    error,
    biometricType,
    securityLevel,
    checkAvailability,
    resetError,
    isFaceIdAvailable,
    isFingerprintAvailable,
    hasBiometrics,
    readyToUse,
  };
};

export default useBiometrics;
