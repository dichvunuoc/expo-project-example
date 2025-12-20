# Biometric Authentication Integration Guide

This guide explains how to integrate biometric authentication (Face ID, Touch ID, Fingerprint) into your Expo application.

## 🚀 Quick Start

### 1. Installation & Setup

```bash
# Install the biometric authentication package
npx expo install expo-local-authentication
```

### 2. App Configuration

The necessary permissions have been added to `app.config.js`:

```javascript
ios: {
  infoPlist: {
    NSFaceIDUsageDescription: 'We use Face ID to securely authenticate you and protect your account.',
    NSFaceIDChangeUsageDescription: 'We use Face ID to securely authenticate you and protect your account.',
    NSTouchIDUsageDescription: 'We use Touch ID to securely authenticate you and protect your account.',
  },
}
```

## 🔧 Implementation

### Basic Usage

```typescript
import { useBiometrics } from '@/hooks/useBiometrics';

function LoginScreen() {
  const { authenticate, canUseForLogin, getPromptMessage } = useBiometrics({
    onSuccess: () => console.log('Authentication successful'),
    onError: (error) => console.error('Authentication failed:', error),
  });

  const handleBiometricLogin = async () => {
    const result = await authenticate({
      promptMessage: 'Login to your account',
    });

    if (result.success) {
      // Proceed with login logic
      navigation.navigate('Home');
    }
  };

  return (
    <View>
      <Button
        title="Login with Face ID"
        onPress={handleBiometricLogin}
        disabled={!canUseForLogin()}
      />
    </View>
  );
}
```

### Advanced Usage with Settings

```typescript
import { useBiometrics } from '@/hooks/useBiometrics';
import { AppStorage } from '@/services/storage';

function BiometricSettings() {
  const {
    isSupported,
    isEnrolled,
    biometricType,
    canUseForLogin,
    authenticate,
    checkAvailability,
  } = useBiometrics();

  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    const enabled = await AppStorage.getBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const toggleBiometricAuth = async () => {
    if (!biometricEnabled) {
      // Enable biometric authentication
      const result = await authenticate({
        promptMessage: 'Enable biometric authentication',
      });

      if (result.success) {
        await AppStorage.setBiometricEnabled(true);
        setBiometricEnabled(true);
      }
    } else {
      // Disable biometric authentication
      await AppStorage.setBiometricEnabled(false);
      setBiometricEnabled(false);
    }
  };

  if (!isSupported) {
    return (
      <View>
        <Text>Biometric authentication is not supported on this device</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>
        {biometricType && `${biometricType} is available`}
      </Text>

      <Text>
        {isEnrolled
          ? 'Biometrics are enrolled on this device'
          : 'Please enroll biometrics in device settings'
        }
      </Text>

      <Switch
        value={biometricEnabled}
        onValueChange={toggleBiometricAuth}
        disabled={!canUseForLogin()}
      />
    </View>
  );
}
```

## 📱 Login Screen Integration

### Step 1: Update Login Screen

```typescript
// app/(auth)/sign-in.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useAuthStore } from '@/features/auth/store';
import { AppStorage } from '@/services/storage';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);

  const { signIn } = useAuthStore();
  const {
    canUseForLogin,
    authenticate,
    biometricType,
    getBiometricIcon,
    getPromptMessage,
    hasBiometrics,
    checkAvailability,
  } = useBiometrics({
    onSuccess: async () => {
      // Biometric auth successful, proceed with saved credentials
      await handleBiometricLogin();
    },
  });

  // Check if user has saved credentials and biometrics enabled
  useEffect(() => {
    checkBiometricPossibility();
  }, []);

  const checkBiometricPossibility = async () => {
    const hasSavedCredentials = await AppStorage.getUserData();
    const biometricEnabled = await AppStorage.getBiometricEnabled();
    const recentAuth = await AppStorage.isBiometricAuthRecent(30); // 30 minutes

    setShowBiometric(
      hasSavedCredentials &&
      biometricEnabled &&
      recentAuth &&
      hasBiometrics
    );
  };

  const handleBiometricLogin = async () => {
    try {
      const userData = await AppStorage.getUserData();
      if (userData?.email && userData?.password) {
        // Use saved credentials to login
        await signIn(userData.email, userData.password);

        // Update last biometric auth time
        await AppStorage.setLastBiometricAuth(new Date().toISOString());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with biometrics');
    }
  };

  const handleLogin = async () => {
    try {
      await signIn(email, password);

      // Offer to enable biometrics after successful login
      if (hasBiometrics && canUseForLogin()) {
        showBiometricSetupPrompt();
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const showBiometricSetupPrompt = () => {
    Alert.alert(
      'Enable Biometric Login?',
      `Would you like to use ${biometricType} for faster login next time?`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const result = await authenticate({
              promptMessage: `Enable ${biometricType} login`,
            });

            if (result.success) {
              await AppStorage.setBiometricEnabled(true);
              await AppStorage.setLastBiometricAuth(new Date().toISOString());
              Alert.alert('Success', `${biometricType} login enabled`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 30, textAlign: 'center' }}>
        Sign In
      </Text>

      {/* Email/Password inputs */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      {/* Biometric Login Button */}
      {showBiometric && (
        <TouchableOpacity
          onPress={() => authenticate({
            promptMessage: getPromptMessage('login'),
          })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 15,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            marginBottom: 15,
          }}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={24}
            color="#007AFF"
          />
          <Text style={{ marginLeft: 10, color: '#007AFF' }}>
            Login with {biometricType}
          </Text>
        </TouchableOpacity>
      )}

      {/* Regular Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🔒 Security Best Practices

### 1. Secure Credential Storage

```typescript
// Store credentials securely after successful login
const handleLoginSuccess = async (email: string, password: string) => {
  // Hash password before storing (optional, depending on your security requirements)
  await AppStorage.setUserData({ email, password });

  // Mark biometric auth time
  if (biometricEnabled) {
    await AppStorage.setLastBiometricAuth(new Date().toISOString());
  }
};
```

### 2. Authentication Timeout

```typescript
// Require biometric re-authentication after certain time
const requireReAuth = async () => {
  const isRecent = await AppStorage.isBiometricAuthRecent(30); // 30 minutes

  if (!isRecent) {
    const result = await authenticate({
      promptMessage: 'Please authenticate to continue',
    });

    if (result.success) {
      await AppStorage.setLastBiometricAuth(new Date().toISOString());
    }

    return result.success;
  }

  return true;
};
```

### 3. Fallback Handling

```typescript
const handleBiometricLogin = async () => {
  const result = await authenticate({
    promptMessage: 'Login with biometrics',
    fallbackLabel: 'Use password',
    cancelLabel: 'Cancel',
  });

  if (result.warning === 'user_fallback') {
    // User chose to use password instead
    // Navigate to password input
    navigation.navigate('PasswordLogin');
    return;
  }

  if (result.success) {
    // Continue with login
    await completeLogin();
  }
};
```

## 🎨 UI Components

### Biometric Button Component

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometrics } from '@/hooks/useBiometrics';

interface BiometricButtonProps {
  onPress: () => void;
  disabled?: boolean;
  action?: string; // "login", "continue", etc.
}

export function BiometricButton({
  onPress,
  disabled,
  action = 'continue'
}: BiometricButtonProps) {
  const { canUseForLogin, getPromptMessage, getBiometricIcon, biometricType } = useBiometrics();

  if (!canUseForLogin()) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Ionicons
        name={getBiometricIcon()}
        size={20}
        color={disabled ? '#999' : '#007AFF'}
      />
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        Use {biometricType} to {action}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  textDisabled: {
    color: '#999',
  },
});
```

### Biometric Status Indicator

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBiometricAvailability } from '@/hooks/useBiometrics';
import { Ionicons } from '@expo/vector-icons';

export function BiometricStatus() {
  const { isSupported, isEnrolled, biometricType, isLoading } = useBiometricAvailability();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking biometric support...</Text>
      </View>
    );
  }

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <Ionicons name="close-circle" size={20} color="#FF3B30" />
        <Text style={[styles.text, styles.errorText]}>
          Biometrics not supported
        </Text>
      </View>
    );
  }

  if (!isEnrolled) {
    return (
      <View style={styles.container}>
        <Ionicons name="information-circle" size={20} color="#FF9500" />
        <Text style={[styles.text, styles.warningText]}>
          No biometrics enrolled
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
      <Text style={[styles.text, styles.successText]}>
        {biometricType} available
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
  },
  successText: {
    color: '#34C759',
  },
  warningText: {
    color: '#FF9500',
  },
  errorText: {
    color: '#FF3B30',
  },
});
```

## 🧪 Testing

### Testing on Different Devices

```typescript
// Test biometric availability
const TestBiometrics = () => {
  const {
    isSupported,
    isEnrolled,
    biometricType,
    checkAvailability,
    isFaceIdAvailable,
    isFingerprintAvailable,
  } = useBiometrics();

  return (
    <View>
      <Text>Supported: {isSupported ? 'Yes' : 'No'}</Text>
      <Text>Enrolled: {isEnrolled ? 'Yes' : 'No'}</Text>
      <Text>Type: {biometricType}</Text>
      <Text>Face ID: {isFaceIdAvailable ? 'Available' : 'Not available'}</Text>
      <Text>Fingerprint: {isFingerprintAvailable ? 'Available' : 'Not available'}</Text>

      <Button title="Re-check" onPress={checkAvailability} />
    </View>
  );
};
```

## 📝 Common Issues & Solutions

### Issue: Face ID prompt shows but authentication fails

**Solution:** Ensure proper permissions in `app.config.js` and that Face ID is properly configured in device settings.

### Issue: Biometric not working on Android

**Solution:** Check that the device has fingerprint hardware and that fingerprints are enrolled in Android settings.

### Issue: Authentication timed out

**Solution:** The default timeout is 60 seconds. Consider customizing the prompt message to inform users they have limited time.

### Issue: Fallback not working

**Solution:** Ensure `disableDeviceFallback: false` in authentication options.

---

## 🎉 Summary

You now have a complete biometric authentication system that:

✅ **Supports Face ID, Touch ID, and Fingerprint**
✅ **Provides graceful fallbacks**
✅ **Handles edge cases and errors**
✅ **Offers secure credential storage**
✅ **Provides excellent UX with clear feedback**
✅ **Works on both iOS and Android**
✅ **Follows security best practices**

Happy coding! 🚀
