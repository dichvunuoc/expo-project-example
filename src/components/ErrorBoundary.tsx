import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logger, error, user } from '@/utils/logger';

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
    // Generate unique error ID for tracking
    this.errorId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Log error with detailed information
    logger.error(
      'React Error Boundary caught an error',
      {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: 'ErrorBoundary',
        },
        errorId: this.errorId,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== 'undefined'
            ? navigator.userAgent
            : 'React Native',
      },
      {
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        requestId: this.errorId,
      }
    );

    // Log to console (will be handled by logger in production)
    error('Error Boundary Error', {
      errorId: this.errorId,
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
    });

    // Track error occurrence
    user.action('error_boundary_triggered', {
      errorId: this.errorId,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in custom error handler', handlerError);
      }
    }

    // TODO: Send to crash reporting service when integrated
    // Example:
    // import * as Sentry from '@sentry/react-native';
    // Sentry.captureException(error, {
    //   tags: {
    //     component: 'ErrorBoundary',
    //     errorId: this.errorId,
    //   },
    //   extra: {
    //     errorInfo,
    //     componentStack: errorInfo.componentStack,
    //   },
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  }

  handleReload = () => {
    logger.info('User initiated app reload from error boundary', {
      errorId: this.errorId,
    });

    this.setState({ hasError: false, error: undefined });

    // Force reload the app
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    } else {
      // For React Native
      try {
        const Updates = require('expo-updates').default;
        if (Updates.reload) {
          Updates.reload();
        } else {
          logger.warn('Updates.reload not available');
        }
      } catch (error) {
        logger.error('Failed to reload app via Expo Updates', error);
        // Fallback: try to restart the app
        const { AppRegistry } = require('react-native');
        AppRegistry.runApplication(
          AppRegistry.getAppKeys()[0],
          AppRegistry.getRunnable(AppRegistry.getAppKeys()[0]).appParameters
        );
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const errorMessage =
        this.props.customErrorMessage ||
        (process.env.NODE_ENV === 'development' && this.state.error
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

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  Error ID: {this.errorId || 'N/A'}
                </Text>
                <Text style={styles.debugText}>
                  Error Name: {this.state.error.name}
                </Text>
                <Text style={styles.debugText}>
                  Component: {this.constructor.name}
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
    fontFamily: 'monospace',
  },
});
