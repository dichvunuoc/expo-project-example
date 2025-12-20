import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  onlineManager,
  focusManager,
  MutationCache,
} from '@tanstack/react-query';
import { api as logger } from '@/utils/logger';

// Network status monitoring configuration
export const setupOnlineManager = () => {
  // Configure TanStack Query Online Manager with NetInfo
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;

      // Update online status
      setOnline(isOnline);

      // Log network status changes
      logger.info(
        `Network status changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
        {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          details: state.details,
        },
        {
          component: 'OnlineManager',
          action: 'NETWORK_STATUS_CHANGE',
        }
      );

      // When coming back online, refocus to trigger refetch
      if (isOnline) {
        focusManager.setFocused(true);
        logger.info(
          'Network restored - triggering refetch',
          {},
          {
            component: 'OnlineManager',
            action: 'NETWORK_RESTORED',
          }
        );
      }
    });
  });
};

// Enhanced mutation cache for offline support
export const createMutationCache = () => {
  return new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      logger.info(
        'Mutation succeeded',
        {
          mutationId: mutation.mutationId,
          variables,
          data,
        },
        {
          component: 'MutationCache',
          action: 'MUTATION_SUCCESS',
        }
      );
    },

    onError: (error, variables, context, mutation) => {
      const isOfflineError =
        error.message?.includes('Network') ||
        error.message?.includes('connection');

      logger.error(
        `Mutation failed${isOfflineError ? ' (offline)' : ''}`,
        {
          mutationId: mutation.mutationId,
          variables,
          error: error.message,
          isOfflineError,
        },
        {
          component: 'MutationCache',
          action: 'MUTATION_ERROR',
        }
      );

      // For offline errors, store mutation for retry when online
      if (isOfflineError && onlineManager.isOnline()) {
        logger.warn(
          'Network error detected but connection appears available - potential connectivity issue',
          {},
          {
            component: 'MutationCache',
            action: 'NETWORK_INCONSISTENCY',
          }
        );
      }
    },

    onSettled: (data, error, variables, context, mutation) => {
      logger.debug(
        'Mutation settled',
        {
          mutationId: mutation.mutationId,
          hasData: !!data,
          hasError: !!error,
        },
        {
          component: 'MutationCache',
          action: 'MUTATION_SETTLED',
        }
      );
    },
  });
};

// Enhanced query client configuration for offline support
export const getQueryClientConfig = () => ({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry network errors immediately - let online manager handle it
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('Network') ||
            error.message.includes('connection') ||
            error.message.includes('timeout'));

        if (isNetworkError) {
          // Don't retry network errors - they'll be retried when online
          return false;
        }

        // Retry other errors up to 3 times
        return failureCount < 3;
      },

      retryDelay: (attemptIndex) => {
        // Exponential backoff for retries
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (renamed from cacheTime)

      // Network mode configuration
      networkMode: 'online', // 'online' | 'always' | 'offlineFirst'

      // Refetch on window focus (app becomes active)
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },

    mutations: {
      // Network mode for mutations
      networkMode: 'offlineFirst', // Try even when offline

      // Retry mutations on failure
      retry: (failureCount, error) => {
        // Retry network errors when offline (they'll be queued)
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('Network') ||
            error.message.includes('connection'));

        // Allow more retries for network errors (they'll be queued)
        if (isNetworkError && !onlineManager.isOnline()) {
          return failureCount < 5; // More retries when offline
        }

        // Standard retry for other errors
        return failureCount < 2;
      },

      retryDelay: (attemptIndex) => {
        // Longer delays for mutations
        return Math.min(1000 * 2 ** attemptIndex, 60000);
      },
    },
  },

  // Use the enhanced mutation cache
  mutationCache: createMutationCache(),
});

// Helper function to check current network status
export const getNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      details: state.details,
    };
  } catch (error) {
    logger.error(
      'Failed to fetch network status',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      {
        component: 'OnlineManager',
        action: 'GET_NETWORK_STATUS_ERROR',
      }
    );

    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
      details: null,
    };
  }
};

// Hook for network status monitoring
export const useNetworkStatus = () => {
  const [status, setStatus] = React.useState({
    isConnected: true,
    isInternetReachable: true,
    type: NetInfo.NETINFO_STATE_TYPE_UNKNOWN as string,
  });

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    return unsubscribe;
  }, []);

  return status;
};

export default {
  setupOnlineManager,
  createMutationCache,
  getQueryClientConfig,
  getNetworkStatus,
  useNetworkStatus,
};
