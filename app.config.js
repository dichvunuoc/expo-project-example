// Load environment variables from .env file
import 'dotenv/config';

const IS_DEV = process.env.NODE_ENV === 'development';

// Base configuration
const baseConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Expo Techgen Template',
  slug: process.env.EXPO_PUBLIC_SLUG || 'com-techgen-template',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/shared/assets/images/icon.png',
  scheme: process.env.EXPO_PUBLIC_SCHEME || 'expoapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './src/shared/assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier:
      process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || 'com.techgen.expo',
    // Biometric authentication permissions
    infoPlist: {
      NSFaceIDUsageDescription:
        'We use Face ID to securely authenticate you and protect your account.',
      NSFaceIDChangeUsageDescription:
        'We use Face ID to securely authenticate you and protect your account.',
      NSTouchIDUsageDescription:
        'We use Touch ID to securely authenticate you and protect your account.',
    },
    // Deep linking configuration for iOS
    associatedDomains: [
      process.env.EXPO_PUBLIC_DEEP_LINK_HOST
        ? `applinks:${process.env.EXPO_PUBLIC_DEEP_LINK_HOST}`
        : `applinks:demo.cudanso.vn`,
    ],
    // Universal Links configuration
    universalLinks: [
      process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'demo.cudanso.vn',
    ],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/shared/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.techgen.expo',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // Deep linking configuration for Android
    intentFilters: [
      {
        action: 'VIEW',
        data: {
          scheme: process.env.EXPO_PUBLIC_SCHEME || 'expoapp',
          host: '*',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'VIEW',
        data: {
          scheme: 'https',
          host: process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'demo.cudanso.vn',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './src/shared/assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './src/shared/assets/images/icon.png',
        color: '#ffffff',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './src/shared/assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
    // Deep linking configuration
    // expo-linking is not a config plugin. Configuration is handled in android/ios sections.
  ],
  experiments: {
    typedRoutes: true,
  },
  // OTA Updates configuration
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  // Extra variables accessible via Constants.expoConfig.extra
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    ANALYTICS_API_KEY: process.env.EXPO_PUBLIC_ANALYTICS_API_KEY,
    IS_DEV,
  },
};

// Development-specific configuration
const devConfig = {
  ...baseConfig,
  name: `${baseConfig.name} (Dev)`,
  plugins: [
    ...baseConfig.plugins,
    // Add development plugins
    'expo-dev-client',
  ],
};

// Production-specific configuration
const prodConfig = {
  ...baseConfig,
  // Production overrides
  plugins: [
    ...baseConfig.plugins,
    // Add production plugins
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
};

// Export the appropriate configuration based on environment
export default IS_DEV ? devConfig : prodConfig;
