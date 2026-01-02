/**
 * Error Boundary Provider
 * FSD Layer: App
 *
 * Global error boundary for the application
 */

import React, { Component, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableReload?: boolean;
  customErrorMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorId: string = '';

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.errorId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    if (__DEV__) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('[ErrorBoundary] Handler error:', handlerError);
      }
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });

    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      try {
        const Updates = require('expo-updates').default;
        if (Updates.reload) {
          Updates.reload();
        }
      } catch (error) {
        console.error('[ErrorBoundary] Failed to reload:', error);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const errorMessage =
        this.props.customErrorMessage ||
        (__DEV__ && this.state.error
          ? this.state.error.message
          : 'An unexpected error occurred. Please try again.');

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>

            {this.props.enableReload !== false && (
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleReload}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  Error ID: {this.errorId || 'N/A'}
                </Text>
                <Text style={styles.debugText}>
                  Error Name: {this.state.error.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
});
