/**
 * Storage service wrapper
 * Provides a type-safe interface for persistent storage using MMKV
 */

import { createMMKV } from 'react-native-mmkv';
import { z } from 'zod';

// Get encryption key from environment variables
const getEncryptionKey = (): string => {
  // In production, encryption key is required
  if (process.env.NODE_ENV === 'production') {
    const key = process.env.EXPO_PUBLIC_STORAGE_KEY;
    if (!key) {
      throw new Error(
        'EXPO_PUBLIC_STORAGE_KEY is required in production. Please set it in your environment variables.'
      );
    }
    return key;
  }

  // In development, use environment key or fallback for convenience
  const key =
    process.env.EXPO_PUBLIC_STORAGE_KEY ||
    'dev-fallback-key-change-in-production';
  if (key === 'dev-fallback-key-change-in-production') {
    console.warn(
      '⚠️ Using fallback encryption key in development. Set EXPO_PUBLIC_STORAGE_KEY for better security.'
    );
  }
  return key;
};

// Storage instance
const storage = createMMKV({
  id: 'app-storage',
  encryptionKey: getEncryptionKey(),
});

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
  LANGUAGE: 'language',
  THEME: 'theme',
  FIRST_LAUNCH: 'first_launch',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_SYNC: 'last_sync',
} as const;

// Type definitions for storage values
type StorageValue = string | number | boolean | object | null;
type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Storage service interface
 */
export interface IStorageService {
  set<T extends StorageValue>(
    key: StorageKey | string,
    value: T
  ): Promise<void>;
  get<T extends StorageValue>(key: StorageKey | string): Promise<T | null>;
  getVerified<T>(
    key: StorageKey | string,
    schema: z.ZodSchema<T>
  ): Promise<T | null>;
  remove(key: StorageKey | string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  has(key: StorageKey | string): Promise<boolean>;
}

/**
 * Storage service implementation using MMKV
 */
export class StorageService implements IStorageService {
  /**
   * Store a value in storage
   * @param key - Storage key
   * @param value - Value to store
   */
  async set<T extends StorageValue>(
    key: StorageKey | string,
    value: T
  ): Promise<void> {
    try {
      if (value === null || value === undefined) {
        storage.remove(key);
        return;
      }

      if (typeof value === 'object') {
        storage.set(key, JSON.stringify(value));
      } else {
        storage.set(key, value);
      }
    } catch (error) {
      throw new Error(
        `Failed to store value for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get a value from storage with proper type validation using Zod
   * @param key - Storage key
   * @param schema - Zod schema to validate the data
   * @returns The stored value if validation succeeds, null otherwise
   */
  async getVerified<T>(
    key: StorageKey | string,
    schema: z.ZodSchema<T>
  ): Promise<T | null> {
    try {
      const value = storage.getString(key);

      if (value === undefined || value === null) {
        return null;
      }

      // Try to parse as JSON first
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        // If JSON parsing fails, use the raw value
        parsedValue = value;
      }

      // Validate with schema
      const result = schema.safeParse(parsedValue);

      if (result.success) {
        return result.data;
      } else {
        console.error(
          `Storage validation failed for key "${key}":`,
          result.error
        );
        // Remove corrupted data to prevent persistent errors
        await this.remove(key);
        return null;
      }
    } catch (error) {
      console.error(
        `Failed to retrieve verified value for key "${key}":`,
        error
      );
      return null;
    }
  }

  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async get<T extends StorageValue>(
    key: StorageKey | string
  ): Promise<T | null> {
    try {
      const value = storage.getString(key);

      if (value === undefined || value === null) {
        return null;
      }

      // Try to parse as JSON first
      try {
        return JSON.parse(value) as T;
      } catch {
        // If JSON parsing fails, return the raw value
        return value as T;
      }
    } catch (error) {
      throw new Error(
        `Failed to retrieve value for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Remove a value from storage
   * @param key - Storage key to remove
   */
  async remove(key: StorageKey | string): Promise<void> {
    try {
      storage.remove(key);
    } catch (error) {
      throw new Error(
        `Failed to remove value for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clear all storage values
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        storage.remove(key);
      }
    } catch (error) {
      throw new Error(
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all storage keys
   * @returns Array of all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return storage.getAllKeys();
    } catch (error) {
      throw new Error(
        `Failed to retrieve all keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - Storage key to check
   * @returns True if key exists, false otherwise
   */
  async has(key: StorageKey | string): Promise<boolean> {
    try {
      return storage.contains(key);
    } catch (error) {
      throw new Error(
        `Failed to check existence of key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get storage size information
   * @returns Storage size in bytes
   */
  async getStorageSize(): Promise<number> {
    try {
      // MMKV doesn't provide direct size info, so we estimate based on keys
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = storage.getString(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }

      return totalSize;
    } catch (error) {
      throw new Error(
        `Failed to get storage size: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export storage data (for backup/migration)
   * @returns Object containing all storage data
   */
  async export(): Promise<Record<string, any>> {
    try {
      const keys = await this.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        const value = await this.get(key);
        data[key] = value;
      }

      return data;
    } catch (error) {
      throw new Error(
        `Failed to export storage data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Import storage data (for restore/migration)
   * @param data - Object containing storage data
   */
  async import(data: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        await this.set(key, value);
      }
    } catch (error) {
      throw new Error(
        `Failed to import storage data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Create singleton instance
export const storageService = new StorageService();

// Convenience methods for common storage operations
export const AuthStorage = {
  setToken: async (token: string): Promise<void> => {
    await storageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: async (): Promise<string | null> => {
    return storageService.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  setRefreshToken: async (refreshToken: string): Promise<void> => {
    await storageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return storageService.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setUserData: async (userData: any): Promise<void> => {
    await storageService.set(STORAGE_KEYS.USER_DATA, userData);
  },

  getUserData: async (): Promise<any | null> => {
    return storageService.get(STORAGE_KEYS.USER_DATA);
  },

  clearAuthData: async (): Promise<void> => {
    await Promise.all([
      storageService.remove(STORAGE_KEYS.AUTH_TOKEN),
      storageService.remove(STORAGE_KEYS.REFRESH_TOKEN),
      storageService.remove(STORAGE_KEYS.USER_DATA),
    ]);
  },
};

export const AppStorage = {
  setSetting: async <T>(setting: string, value: T): Promise<void> => {
    const currentSettings =
      (await storageService.get<Record<string, any>>(
        STORAGE_KEYS.APP_SETTINGS
      )) || {};
    currentSettings[setting] = value;
    await storageService.set(STORAGE_KEYS.APP_SETTINGS, currentSettings);
  },

  getSetting: async <T>(setting: string): Promise<T | null> => {
    const settings =
      (await storageService.get<Record<string, any>>(
        STORAGE_KEYS.APP_SETTINGS
      )) || {};
    return settings[setting] || null;
  },

  setBiometricEnabled: async (enabled: boolean): Promise<void> => {
    await AppStorage.setSetting('biometricEnabled', enabled);
  },

  getBiometricEnabled: async (): Promise<boolean> => {
    return (await AppStorage.getSetting<boolean>('biometricEnabled')) ?? false;
  },

  setLastBiometricAuth: async (timestamp: string): Promise<void> => {
    await AppStorage.setSetting('lastBiometricAuth', timestamp);
  },

  getLastBiometricAuth: async (): Promise<string | null> => {
    return await AppStorage.getSetting<string>('lastBiometricAuth');
  },

  isBiometricAuthRecent: async (
    minutesThreshold: number = 30
  ): Promise<boolean> => {
    const lastAuth = await AppStorage.getLastBiometricAuth();
    if (!lastAuth) return false;

    const lastAuthTime = new Date(lastAuth).getTime();
    const currentTime = new Date().getTime();
    const thresholdMs = minutesThreshold * 60 * 1000;

    return currentTime - lastAuthTime < thresholdMs;
  },

  setLanguage: async (language: string): Promise<void> => {
    await storageService.set(STORAGE_KEYS.LANGUAGE, language);
  },

  getLanguage: async (): Promise<string | null> => {
    return storageService.get<string>(STORAGE_KEYS.LANGUAGE);
  },

  setTheme: async (theme: string): Promise<void> => {
    await storageService.set(STORAGE_KEYS.THEME, theme);
  },

  getTheme: async (): Promise<string | null> => {
    return storageService.get<string>(STORAGE_KEYS.THEME);
  },

  isFirstLaunch: async (): Promise<boolean> => {
    const firstLaunch = await storageService.get<boolean>(
      STORAGE_KEYS.FIRST_LAUNCH
    );
    if (firstLaunch === null) {
      await storageService.set(STORAGE_KEYS.FIRST_LAUNCH, false);
      return true;
    }
    return firstLaunch;
  },

  setOnboardingCompleted: async (completed: boolean): Promise<void> => {
    await storageService.set(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },

  isOnboardingCompleted: async (): Promise<boolean> => {
    const result = await storageService.get<boolean>(
      STORAGE_KEYS.ONBOARDING_COMPLETED
    );
    return result || false;
  },

  setLastSync: async (timestamp: string): Promise<void> => {
    await storageService.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  },

  getLastSync: async (): Promise<string | null> => {
    return storageService.get<string>(STORAGE_KEYS.LAST_SYNC);
  },
};

export default storageService;
