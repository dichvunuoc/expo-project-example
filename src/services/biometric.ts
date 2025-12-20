import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { api as logger } from '@/utils/logger';

/**
 * Biometric authentication types
 */
export type BiometricType = LocalAuthentication.AuthenticationType;
export type BiometricSecurityLevel = LocalAuthentication.SecurityLevel;

/**
 * Biometric authentication result
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
  warning?: string;
  biometricType?: BiometricType;
}

/**
 * Biometric availability information
 */
export interface BiometricAvailability {
  supported: boolean;
  enrolled: boolean;
  hardwareSupported: boolean;
  biometricTypes: BiometricType[];
  securityLevel: BiometricSecurityLevel | null;
}

/**
 * Biometric authentication service
 */
export class BiometricService {
  private static instance: BiometricService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is supported on this device
   */
  async checkBiometricSupported(): Promise<BiometricAvailability> {
    try {
      logger.info(
        'Checking biometric support',
        {},
        {
          component: 'BiometricService',
          action: 'CHECK_SUPPORT_START',
        }
      );

      // Check if device supports biometric authentication
      const hardwareSupported = await LocalAuthentication.hasHardwareAsync();

      if (!hardwareSupported) {
        logger.warn(
          'Device does not support biometric hardware',
          {},
          {
            component: 'BiometricService',
            action: 'HARDWARE_NOT_SUPPORTED',
          }
        );

        return {
          supported: false,
          enrolled: false,
          hardwareSupported: false,
          biometricTypes: [],
          securityLevel: null,
        };
      }

      // Check what biometric types are available
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Check if user has enrolled any biometrics
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      // Get security level
      const securityLevel = await LocalAuthentication.getSecurityLevelAsync();

      const availability: BiometricAvailability = {
        supported: true,
        enrolled,
        hardwareSupported: true,
        biometricTypes: supportedTypes,
        securityLevel,
      };

      logger.info(
        'Biometric support check completed',
        {
          hardwareSupported,
          supportedTypes,
          enrolled,
          securityLevel,
        },
        {
          component: 'BiometricService',
          action: 'CHECK_SUPPORT_SUCCESS',
        }
      );

      return availability;
    } catch (error) {
      logger.error(
        'Failed to check biometric support',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        {
          component: 'BiometricService',
          action: 'CHECK_SUPPORT_ERROR',
        }
      );

      return {
        supported: false,
        enrolled: false,
        hardwareSupported: false,
        biometricTypes: [],
        securityLevel: null,
      };
    }
  }

  /**
   * Get human-readable biometric type name
   */
  getBiometricTypeName(type: BiometricType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris Scanner';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get primary biometric type for the device
   */
  async getPrimaryBiometricType(): Promise<string | null> {
    const { biometricTypes } = await this.checkBiometricSupported();

    // Priority order: Face ID > Fingerprint > Iris > Other
    const priorityOrder = [
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      LocalAuthentication.AuthenticationType.FINGERPRINT,
      LocalAuthentication.AuthenticationType.IRIS,
    ];

    for (const type of priorityOrder) {
      if (biometricTypes.includes(type)) {
        return this.getBiometricTypeName(type);
      }
    }

    return biometricTypes.length > 0
      ? this.getBiometricTypeName(biometricTypes[0])
      : null;
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(options?: {
    promptMessage?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    requireDeviceUnlock?: boolean;
  }): Promise<BiometricResult> {
    try {
      logger.info(
        'Starting biometric authentication',
        { options },
        {
          component: 'BiometricService',
          action: 'AUTH_START',
        }
      );

      // Check availability first
      const availability = await this.checkBiometricSupported();

      if (!availability.supported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device',
        };
      }

      if (!availability.enrolled) {
        return {
          success: false,
          error: 'No biometrics are enrolled on this device',
        };
      }

      // Set default options
      const authOptions: LocalAuthentication.AuthenticateOptions = {
        promptMessage: options?.promptMessage || 'Authenticate to continue',
        fallbackLabel: options?.fallbackLabel || 'Use passcode',
        cancelLabel: options?.cancelLabel || 'Cancel',
        disableDeviceFallback: false,
        requireDeviceUnlock: options?.requireDeviceUnlock ?? false,
      };

      // On iOS, we need to handle device unlock properly
      if (Platform.OS === 'ios') {
        // For iOS, we don't set requireDeviceUnlock to avoid double prompts
        delete authOptions.requireDeviceUnlock;
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        logger.info(
          'Biometric authentication successful',
          {
            biometricType: availability.biometricTypes[0],
          },
          {
            component: 'BiometricService',
            action: 'AUTH_SUCCESS',
          }
        );

        return {
          success: true,
          biometricType: availability.biometricTypes[0],
        };
      } else {
        const warning = this.getAuthenticationErrorMessage(result.error);

        logger.warn(
          'Biometric authentication failed',
          {
            error: result.error,
            warning,
          },
          {
            component: 'BiometricService',
            action: 'AUTH_FAILED',
          }
        );

        return {
          success: false,
          warning,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';

      logger.error(
        'Biometric authentication error',
        {
          error: errorMessage,
        },
        {
          component: 'BiometricService',
          action: 'AUTH_ERROR',
        }
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get human-readable error message for authentication failures
   */
  private getAuthenticationErrorMessage(error?: string): string {
    switch (error) {
      case 'user_cancel':
        return 'Authentication was cancelled';
      case 'user_fallback':
        return 'Using device passcode instead';
      case 'system_cancel':
        return 'Authentication was cancelled by the system';
      case 'passcode_not_set':
        return 'Device passcode is not set';
      case 'not_available':
        return 'Biometric authentication is not available';
      case 'not_enrolled':
        return 'No biometrics are enrolled';
      case 'authentication_failed':
        return 'Authentication failed';
      case 'too_many_attempts':
        return 'Too many failed attempts. Please try again later.';
      case 'lockout':
        return 'Biometric authentication is locked. Please use device passcode.';
      case 'lockout_permanent':
        return 'Biometric authentication is permanently locked. Please restart your device.';
      case 'authentication_invalid_context':
        return 'Authentication context is invalid';
      case 'authentication_timeout':
        return 'Authentication timed out';
      default:
        return error || 'Authentication failed';
    }
  }

  /**
   * Check if Face ID is available
   */
  async isFaceIdAvailable(): Promise<boolean> {
    try {
      const { biometricTypes } = await this.checkBiometricSupported();
      return biometricTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if Touch ID/Fingerprint is available
   */
  async isFingerprintAvailable(): Promise<boolean> {
    try {
      const { biometricTypes } = await this.checkBiometricSupported();
      return biometricTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if device has any biometric authentication method
   */
  async hasAnyBiometric(): Promise<boolean> {
    const { biometricTypes } = await this.checkBiometricSupported();
    return biometricTypes.length > 0;
  }

  /**
   * Get appropriate biometric icon name
   */
  getBiometricIcon(type?: BiometricType): string {
    if (!type) {
      return 'fingerprint'; // Default fallback
    }

    switch (type) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'face-id';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'fingerprint';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'eye';
      default:
        return 'fingerprint';
    }
  }
}

// Export singleton instance
export const biometricService = BiometricService.getInstance();

export default biometricService;
