// Load environment variables from .env file
import 'dotenv/config';

const IS_DEV = process.env.NODE_ENV === 'development';

// Base configuration
const baseConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Expo Enterprise Template',
  slug: process.env.EXPO_PUBLIC_SLUG || 'expo-enterprise-template',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: process.env.EXPO_PUBLIC_SCHEME || 'expoapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier:
      process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || 'com.company.expoapp',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.company.expoapp',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
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
      'expo-sentry',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
};

// Export the appropriate configuration based on environment
export default IS_DEV ? devConfig : prodConfig;
