/**
 * Application constants
 * Centralized configuration for consistency and maintainability
 */

// ==============================
// API Configuration
// ==============================

/** API endpoints for authentication */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    GET_CURRENT_USER: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  USER: {
    GET_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DELETE_ACCOUNT: '/user/account',
    UPLOAD_AVATAR: '/user/avatar',
  },
  GENERAL: {
    HEALTH_CHECK: '/health',
    VERSION: '/version',
  },
} as const;

// ==============================
// Storage Keys
// ==============================

/** MMKV storage identifiers for persistence */
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',

  // Theme
  THEME_MODE: 'theme_mode',

  // Onboarding
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Settings
  LANGUAGE: 'app_language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  AUTO_LOGIN: 'auto_login_enabled',

  // Cache
  CACHED_API_RESPONSES: 'cached_api_responses',
  OFFLINE_QUEUE: 'offline_queue',
} as const;

// ==============================
// Application Configuration
// ==============================

/** Application settings and limits */
export const CONFIG = {
  // API Settings
  API_TIMEOUT: 15000, // 15 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000, // 1 second

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Cache
  CACHE_EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50, // items

  // Security
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // App Settings
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Animation
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Screen Dimensions
  SCREEN_DIMENSIONS: {
    MIN_WIDTH: 320,
    MIN_HEIGHT: 568,
    TABLET_BREAKPOINT: 768,
  },

  // Debounce
  DEBOUNCE_TIME: {
    SEARCH: 300,
    INPUT: 500,
    SCROLL: 100,
  },
} as const;

// ==============================
// Error Codes
// ==============================

/** Standardized error codes for the application */
export const ERROR_CODES = {
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',

  // Authentication Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Business Logic Errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  // System Errors
  STORAGE_ERROR: 'STORAGE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // App-specific Errors
  OFFLINE_MODE: 'OFFLINE_MODE',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
} as const;

// ==============================
// Status Codes
// ==============================

/** HTTP and application status codes */
export const STATUS_CODES = {
  // HTTP Status
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_NO_CONTENT: 204,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_CONFLICT: 409,
  HTTP_UNPROCESSABLE_ENTITY: 422,
  HTTP_TOO_MANY_REQUESTS: 429,
  HTTP_INTERNAL_SERVER_ERROR: 500,
  HTTP_BAD_GATEWAY: 502,
  HTTP_SERVICE_UNAVAILABLE: 503,
  HTTP_GATEWAY_TIMEOUT: 504,

  // App Status
  STATUS_SUCCESS: 'success',
  STATUS_ERROR: 'error',
  STATUS_LOADING: 'loading',
  STATUS_IDLE: 'idle',
} as const;

// ==============================
// Environment Types
// ==============================

/** Environment detection and configuration */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'test',
} as const;

// ==============================
// Feature Flags
// ==============================

/** Feature toggle configuration */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: 'enable_analytics',
  ENABLE_CRASH_REPORTING: 'enable_crash_reporting',
  ENABLE_PUSH_NOTIFICATIONS: 'enable_push_notifications',
  ENABLE_BIOMETRIC: 'enable_biometric',
  ENABLE_OFFLINE_MODE: 'enable_offline_mode',
  ENABLE_DARK_MODE: 'enable_dark_mode',
  DEBUG_MODE: 'debug_mode',
} as const;

// ==============================
// Default Values
// ==============================

/** Default values used throughout the application */
export const DEFAULTS = {
  // User Defaults
  USER_NAME: 'User',
  USER_AVATAR: '/assets/images/default-avatar.png',

  // UI Defaults
  ANIMATION_ENABLED: true,
  HAPTICS_ENABLED: true,
  AUTO_PLAY_VIDEOS: false,

  // List Defaults
  EMPTY_LIST_MESSAGE: 'No data available',
  LOADING_MORE_MESSAGE: 'Loading more items...',

  // Form Defaults
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
} as const;

// ==============================
// Type Guards
// ==============================

/** Type checking utilities for constants */
export const isApiEndpoint = (
  value: string
): value is keyof typeof API_ENDPOINTS.AUTH => {
  return Object.values(API_ENDPOINTS.AUTH).includes(value);
};

export const isStorageKey = (
  value: string
): value is keyof typeof STORAGE_KEYS => {
  return Object.values(STORAGE_KEYS).includes(value);
};

export const isErrorCode = (
  value: string
): value is keyof typeof ERROR_CODES => {
  return Object.values(ERROR_CODES).includes(value);
};

// ==============================
// Utility Functions
// ==============================

/** Helper functions for working with constants */
export const ConstantsUtils = {
  /** Get full API endpoint URL */
  getApiUrl: (endpoint: string, baseUrl?: string): string => {
    const apiBaseUrl = baseUrl || process.env.EXPO_PUBLIC_API_URL || '';
    return `${apiBaseUrl.replace(/\/$/, '')}${endpoint}`;
  },

  /** Check if current environment is production */
  isProduction: (): boolean => {
    return process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION;
  },

  /** Check if current environment is development */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT;
  },

  /** Get timeout based on environment */
  getApiTimeout: (): number => {
    return ConstantsUtils.isDevelopment()
      ? CONFIG.API_TIMEOUT * 2 // Longer timeout for dev
      : CONFIG.API_TIMEOUT;
  },

  /** Format file size with proper units */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

// Export all constants as a single object for convenience
export const APP_CONSTANTS = {
  API_ENDPOINTS,
  STORAGE_KEYS,
  CONFIG,
  ERROR_CODES,
  STATUS_CODES,
  ENVIRONMENTS,
  FEATURE_FLAGS,
  DEFAULTS,
} as const;
