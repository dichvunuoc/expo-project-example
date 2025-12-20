# Deep Linking Implementation Guide

This guide explains how deep linking is implemented in your Expo Router app and how to test it.

## 📋 Table of Contents

1. [Configuration](#configuration)
2. [URL Structure](#url-structure)
3. [Testing Deep Links](#testing-deep-links)
4. [Component Usage](#component-usage)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Configuration

### App Scheme Configuration

Your app is configured with deep linking support in `app.config.js`:

```javascript
// app.config.js
const config = {
  // ... other config
  scheme: process.env.EXPO_PUBLIC_SCHEME || 'expoapp',

  android: {
    // Deep linking for Android
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
          host: process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'expoapp.example.com',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  ios: {
    // Universal Links for iOS
    associatedDomains: [
      `applinks:${process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'expoapp.example.com'}`,
    ],
    universalLinks: [
      process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'expoapp.example.com',
    ],
  },

  plugins: [
    // ... other plugins
    [
      'expo-linking',
      {
        prefixes: [
          `${process.env.EXPO_PUBLIC_SCHEME || 'expoapp'}://`,
          `https://${process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'expoapp.example.com'}`,
        ],
        config: {
          screens: {
            user: {
              screens: {
                profile: 'user/:userId',
                settings: 'user/settings',
              },
            },
            product: {
              screens: {
                detail: 'product/:productId',
                review: 'product/:productId/review',
              },
            },
            auth: {
              screens: {
                login: 'auth',
                register: 'auth/register',
                reset: 'auth/reset',
              },
            },
          },
        },
      },
    ],
  ],
};
```

### Environment Variables

Create/update your `.env` file:

```bash
# .env
EXPO_PUBLIC_SCHEME=expoapp
EXPO_PUBLIC_DEEP_LINK_HOST=expoapp.example.com
```

---

## 🔗 URL Structure

### Supported Routes

Your app supports the following deep link routes:

#### User Routes

```
expoapp://user/:userId
expoapp://user/settings
expoapp://user/:userId/edit

https://expoapp.example.com/user/123
https://expoapp.example.com/user/settings
```

#### Product Routes

```
expoapp://product/:productId
expoapp://product/:productId/review
expoapp://product/:productId/share

https://expoapp.example.com/product/prod123
https://expoapp.example.com/product/prod456/review
```

#### Authentication Routes

```
expoapp://auth
expoapp://auth/register
expoapp://auth/reset
expoapp://auth/verify/:token

https://expoapp.example.com/auth
https://expoapp.example.com/auth/verify/abc123
```

#### Content Routes

```
expoapp://blog/:postId
expoapp://category/:categoryId
expoapp://search

https://expoapp.example.com/blog/post123
https://expoapp.example.com/search?query=react
```

#### Social Routes

```
expoapp://invite/:code
expoapp://share/:type/:id
expoapp://ref/:code

https://expoapp.example.com/invite/invite123
https://expoapp.example.com/share/product/prod456
```

### URL Parameters

You can pass additional parameters as query strings:

```
expoapp://user/123?source=email&tab=posts&message=Welcome back!
https://expoapp.example.com/product/prod456?category=electronics&discount=10
```

---

## 🧪 Testing Deep Links

### Quick Testing Commands

#### Using the Testing Script

```bash
# Make the script executable
chmod +x scripts/test-deep-links.sh

# Run with default configuration
./scripts/test-deep-links.sh

# Run with custom configuration
./scripts/test-deep-links.sh myapp myhost.com

# Test specific URL
./scripts/test-deep-links.sh expoapp "expoapp://user/123"

# Test all URLs
./scripts/test-deep-links.sh expoapp myhost.com all
```

#### Manual Testing

```bash
# Test with uri-scheme
npx uri-scheme open "expoapp://user/123"
npx uri-scheme open "https://expoapp.example.com/user/123"

# Android testing with ADB
adb shell am start -W -a android.intent.action.VIEW -d "expoapp://user/123" com.company.expoapp
adb shell am start -W -a android.intent.action.VIEW -d "https://expoapp.example.com/user/123" com.company.expoapp

# iOS testing with Xcode
xcrun simctl openurl booted "expoapp://user/123"
xcrun simctl openurl booted "https://expoapp.example.com/user/123"
```

### Development Testing

1. **Start your app:**

```bash
npm start
# or
expo start
```

2. **Open deep links:**

```bash
# Method 1: Use the testing script
./scripts/test-deep-links.sh

# Method 2: Use uri-scheme directly
npx uri-scheme open "expoapp://user/123?source=email"

# Method 3: Use Expo CLI
expo open-url "expoapp://user/123"
```

### Production Testing

#### Android

1. Build and install the APK
2. Use ADB or browser to test deep links
3. Test with different browsers (Chrome, Firefox, etc.)

#### iOS

1. Build and install the IPA
2. Test with Safari, Mail, Messages
3. Verify Universal Links work with https:// URLs

---

## 📱 Component Usage

### Basic Parameter Extraction

```tsx
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfileScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    source?: string;
    tab?: string;
    message?: string;
  }>();

  return (
    <View>
      <Text>User ID: {params.userId}</Text>
      {params.source && <Text>Source: {params.source}</Text>}
      {params.tab && <Text>Tab: {params.tab}</Text>}
      {params.message && <Text>Message: {params.message}</Text>}
    </View>
  );
}
```

### Advanced Deep Link Handling

```tsx
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useDeepLinking } from '@/navigation/linking';

export default function AdvancedProfileScreen() {
  const params = useLocalSearchParams<{ userId: string }>();
  const { url, parsedLink, isValid } = useDeepLinking();

  React.useEffect(() => {
    // Check if user came from deep link
    if (url && isValid) {
      console.log('Deep link accessed:', {
        url,
        route: parsedLink?.route,
        params: parsedLink?.params,
      });

      // Track deep link usage
      // analytics.track('deep_link_accessed', {
      //   url,
      //   route: parsedLink?.route,
      //   userId: params.userId,
      // });
    }
  }, [url, isValid, params.userId]);

  const handleShare = () => {
    // Generate deep link for sharing
    const shareUrl = linkingConfig.generateUrl(
      'USER_PROFILE',
      {
        userId: params.userId,
      },
      false
    );

    // Share.share({
    //   title: 'Check out this user profile',
    //   url: shareUrl,
    // });
  };

  return (
    <View>
      <Text>User Profile: {params.userId}</Text>
      {url && <Text>Accessed via: {url}</Text>}
      <Button title="Share Profile" onPress={handleShare} />
    </View>
  );
}
```

### Type-Safe Route Generation

```tsx
import { linkingConfig, DEEP_LINK_ROUTES } from '@/navigation/linking';

const MyComponent = () => {
  const generateShareLink = (userId: string) => {
    // Type-safe URL generation
    const userProfileUrl = linkingConfig.generateUrl(
      'USER_PROFILE',
      {
        userId,
      },
      false
    ); // Use custom scheme

    const universalUrl = linkingConfig.generateUrl(
      'USER_PROFILE',
      {
        userId,
      },
      true
    ); // Use universal link

    return {
      custom: userProfileUrl,
      universal: universalUrl,
    };
  };

  const handleShare = () => {
    const urls = generateShareLink('123');
    console.log('Share URLs:', urls);
  };

  return <Button title="Share" onPress={handleShare} />;
};
```

---

## 🚀 Advanced Features

### Custom Linking Configuration

```tsx
import { Linking } from 'expo-router';

// Custom linking config for complex scenarios
const customLinking = {
  prefixes: ['expoapp://', 'https://expoapp.example.com'],
  config: {
    screens: {
      user: {
        screens: {
          profile: 'user/:userId',
          posts: 'user/:userId/posts/:postId?',
          settings: 'user/settings',
        },
      },
    },
  },
};

// In your root component
export default function RootLayout() {
  return (
    <Linking linking={customLinking}>
      <Stack>
        <Stack.Screen name="user/[userId]" />
        <Stack.Screen name="user/[userId]/posts/[postId]" />
        <Stack.Screen name="user/settings" />
      </Stack>
    </Linking>
  );
}
```

### Deep Link Validation

```tsx
import { linkingConfig, ParsedDeepLink } from '@/navigation/linking';

const validateAndProcessLink = (url: string) => {
  const parsed: ParsedDeepLink = linkingConfig.parseUrl(url);

  if (parsed.isValid) {
    // Valid deep link
    switch (parsed.route) {
      case 'USER_PROFILE':
        // Handle user profile deep link
        router.push(`/user/${parsed.params?.userId}`);
        break;
      case 'PRODUCT_DETAIL':
        // Handle product deep link
        router.push(`/product/${parsed.params?.productId}`);
        break;
      // ... other routes
    }
  } else {
    // Invalid deep link
    console.warn('Invalid deep link:', url);
    // Show error or redirect to home
    router.replace('/');
  }
};
```

### Universal Links Setup

For production universal links:

1. **Create Apple App Site Association file:**

```json
// apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.company.expoapp",
        "paths": ["/user/*", "/product/*", "/auth/*"]
      }
    ]
  }
}
```

2. **Create Asset Links file for Android:**

```json
// assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.company.expoapp",
      "sha256_cert_fingerprints": ["YOUR_CERTIFICATE_FINGERPRINT"]
    }
  }
]
```

---

## 🔧 Troubleshooting

### Common Issues

#### Deep Links Not Working on Android

```bash
# Check if intent filters are correctly configured
adb shell dumpsys package com.company.expoapp | grep intent

# Test manually with ADB
adb shell am start -W -a android.intent.action.VIEW -d "expoapp://user/123" com.company.expoapp
```

#### Universal Links Not Working on iOS

```bash
# Check associated domains
xcrun simctl getpp booted com.apple.mobileasset

# Test with Safari
# Open the URL in Safari and check if app opens
```

#### Schema Not Registered

```bash
# Check if schema is properly registered
npx uri-scheme list
```

### Debug Logging

Enable debug logging in your linking configuration:

```tsx
// src/navigation/linking.ts
const linkingConfig = new LinkingConfig();

// Enable debug mode for development
if (__DEV__) {
  console.log('Deep linking prefixes:', linkingConfig.getPrefixes());
  console.log('Supported routes:', DEEP_LINK_ROUTES);
}
```

### Testing Checklist

- [ ] Custom scheme URLs work (`expoapp://user/123`)
- [ ] Universal links work (`https://expoapp.example.com/user/123`)
- [ ] Query parameters are parsed correctly
- [ ] App handles cold starts (app closed)
- [ ] App handles warm starts (app in background)
- [ ] Error cases are handled gracefully
- [ ] Both Android and iOS work
- [ ] Different browsers/apps can trigger deep links

### Performance Considerations

- Minimize deep link processing time
- Use debouncing for rapid deep link calls
- Cache parsed results for repeated URLs
- Handle deep links asynchronously to avoid blocking UI

---

## 📚 Additional Resources

- [Expo Router Deep Linking Documentation](https://docs.expo.dev/router/reference/deep-linking)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/linking)
- [Apple Universal Links Guide](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Android App Links Guide](https://developer.android.com/training/app-links)

---

## ✅ Implementation Summary

✅ **App Configuration**: Custom scheme and universal links configured  
✅ **URL Mapping**: File-based routing automatically handles deep links  
✅ **Parameter Extraction**: `useLocalSearchParams` provides type-safe access  
✅ **URL Generation**: Centralized utility for creating deep links  
✅ **Testing Tools**: Scripts and commands for comprehensive testing  
✅ **Error Handling**: Graceful fallbacks and validation  
✅ **Platform Support**: Both Android and iOS supported  
✅ **Development Tools**: Debug logging and utilities

Your deep linking implementation is now complete and ready for use! 🎉
