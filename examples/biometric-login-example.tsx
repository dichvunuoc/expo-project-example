import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometrics, useBiometricAvailability } from '@/hooks/useBiometrics';
import { AppStorage } from '@/services/storage';
import { useAuthStore } from '@/features/auth/store';

/**
 * Complete example of biometric login implementation
 */
export function BiometricLoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  // Auth store
  const { signIn, isAuthenticated } = useAuthStore();

  // Biometric hooks
  const {
    authenticate,
    canUseForLogin,
    biometricType,
    getBiometricIcon,
    getPromptMessage,
    hasBiometrics,
    isLoading: biometricLoading,
  } = useBiometrics({
    onSuccess: () => {
      console.log('Biometric authentication successful');
      handleBiometricLogin();
    },
    onError: (error) => {
      console.error('Biometric authentication failed:', error);
    },
  });

  const { isSupported, isEnrolled, checkAvailability } =
    useBiometricAvailability();

  // Initialize biometric settings
  useEffect(() => {
    initializeBiometricSettings();
  }, []);

  useEffect(() => {
    updateBiometricAvailability();
  }, [isSupported, isEnrolled, biometricEnabled]);

  const initializeBiometricSettings = async () => {
    try {
      const enabled = await AppStorage.getBiometricEnabled();
      setBiometricEnabled(enabled);

      // Check if user has saved credentials
      const userData = await AppStorage.getUserData();
      const hasCredentials = userData?.email && userData?.password;

      setShowBiometricOption(hasCredentials && enabled && hasBiometrics);
    } catch (error) {
      console.error('Failed to initialize biometric settings:', error);
    }
  };

  const updateBiometricAvailability = () => {
    // Update UI based on biometric availability
    if (!isSupported || !isEnrolled) {
      setShowBiometricOption(false);
    }
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      await signIn(email, password);

      // Save credentials for future biometric login
      await AppStorage.setUserData({ email, password });

      // Offer to enable biometrics if available
      if (hasBiometrics && canUseForLogin() && !biometricEnabled) {
        showBiometricSetupDialog();
      } else {
        // Update last auth time if biometrics already enabled
        if (biometricEnabled) {
          await AppStorage.setLastBiometricAuth(new Date().toISOString());
        }
      }

      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      // Retrieve saved credentials
      const userData = await AppStorage.getUserData();
      if (!userData?.email || !userData?.password) {
        Alert.alert('Error', 'No saved credentials found');
        return;
      }

      // Login with saved credentials
      await signIn(userData.email, userData.password);

      // Update last biometric auth time
      await AppStorage.setLastBiometricAuth(new Date().toISOString());

      Alert.alert('Success', 'Biometric login successful!');
    } catch (error) {
      Alert.alert('Error', 'Failed to login with biometrics');
    }
  };

  const showBiometricSetupDialog = () => {
    Alert.alert(
      'Enable Biometric Login?',
      `Would you like to use ${biometricType} for faster login next time?`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            await setupBiometricAuthentication();
          },
        },
      ]
    );
  };

  const setupBiometricAuthentication = async () => {
    try {
      const result = await authenticate({
        promptMessage: `Enable ${biometricType} login`,
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await AppStorage.setBiometricEnabled(true);
        await AppStorage.setLastBiometricAuth(new Date().toISOString());
        setBiometricEnabled(true);
        Alert.alert('Success', `${biometricType} login enabled!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enable biometric authentication');
    }
  };

  const toggleBiometricAuth = async () => {
    if (biometricEnabled) {
      // Disable biometric authentication
      await AppStorage.setBiometricEnabled(false);
      setBiometricEnabled(false);
      Alert.alert('Success', 'Biometric login disabled');
    } else {
      // Enable biometric authentication
      await setupBiometricAuthentication();
    }
  };

  const handleBiometricQuickLogin = async () => {
    if (!showBiometricOption) {
      Alert.alert(
        'Info',
        'Please login with password first to enable biometric login'
      );
      return;
    }

    try {
      const result = await authenticate({
        promptMessage: getPromptMessage('login'),
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        await handleBiometricLogin();
      }
    } catch (error) {
      console.error('Quick biometric login failed:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>You are logged in</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Biometric Login Demo</Text>

      {/* Biometric Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Biometric Status</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={isSupported ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={isSupported ? '#34C759' : '#FF3B30'}
          />
          <Text style={styles.statusText}>
            {isSupported
              ? 'Biometric hardware supported'
              : 'No biometric hardware'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Ionicons
            name={isEnrolled ? 'checkmark-circle' : 'information-circle'}
            size={20}
            color={isEnrolled ? '#34C759' : '#FF9500'}
          />
          <Text style={styles.statusText}>
            {isEnrolled ? 'Biometrics enrolled' : 'No biometrics enrolled'}
          </Text>
        </View>
        {biometricType && (
          <View style={styles.statusRow}>
            <Ionicons name="fingerprint" size={20} color="#007AFF" />
            <Text style={styles.statusText}>Available: {biometricType}</Text>
          </View>
        )}
      </View>

      {/* Login Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Biometric Quick Login */}
        {showBiometricOption && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricQuickLogin}
            disabled={biometricLoading}
          >
            <Ionicons name={getBiometricIcon()} size={24} color="#007AFF" />
            <Text style={styles.biometricButtonText}>
              Use {biometricType} to Login
            </Text>
          </TouchableOpacity>
        )}

        {/* Regular Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>
            Enable {biometricType || 'Biometric'} Login
          </Text>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometricAuth}
            disabled={!canUseForLogin()}
          />
        </View>

        {!canUseForLogin() && (
          <Text style={styles.helperText}>
            Biometrics not available. Please enroll biometrics in device
            settings.
          </Text>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={checkAvailability}
        >
          <Ionicons name="refresh" size={20} color="#007AFF" />
          <Text style={styles.refreshButtonText}>Check Biometric Status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  biometricButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
});

export default BiometricLoginExample;
