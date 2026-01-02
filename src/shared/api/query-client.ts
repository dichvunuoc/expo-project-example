/**
 * TanStack Query Client Configuration
 * FSD Layer: Shared
 */

import NetInfo from '@react-native-community/netinfo';
import {
  MutationCache,
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';

// Guard to ensure setupOnlineManager only runs once
let isOnlineManagerSetup = false;

/**
 * Setup online manager for network status monitoring
 */
export const setupOnlineManager = () => {
  // Prevent multiple setups
  if (isOnlineManagerSetup) {
    return;
  }

  isOnlineManagerSetup = true;

  onlineManager.setEventListener((setOnline) => {
    let lastStatus: boolean | null = null;
    let initializationComplete = false;

    return NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;

      // Only log if status actually changed (not during initialization spam)
      if (lastStatus !== null && lastStatus !== isOnline) {
        if (__DEV__) {
          console.log(
            `[Network] Status changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`
          );
        }
      }

      // Mark initialization as complete after first event
      if (!initializationComplete) {
        initializationComplete = true;
        // Only log initial status if offline (more important)
        if (__DEV__ && !isOnline) {
          console.log(`[Network] Initial status: OFFLINE`);
        }
      }

      lastStatus = isOnline;
      setOnline(isOnline);

      if (isOnline) {
        focusManager.setFocused(true);
      }
    });
  });
};

/**
 * Create enhanced mutation cache for offline support
 */
const createMutationCache = () => {
  return new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      if (__DEV__) {
        console.log('[Mutation] Success:', mutation.mutationId);
      }
    },

    onError: (error, variables, context, mutation) => {
      const isOfflineError =
        error.message?.includes('Network') ||
        error.message?.includes('connection');

      if (__DEV__) {
        console.error(
          `[Mutation] Failed${isOfflineError ? ' (offline)' : ''}:`,
          mutation.mutationId
        );
      }
    },
  });
};

/**
 * Query client configuration
 */
const getQueryClientConfig = () => ({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('Network') ||
            error.message.includes('connection') ||
            error.message.includes('timeout'));

        if (isNetworkError) {
          return false;
        }

        return failureCount < 3;
      },

      retryDelay: (attemptIndex: number) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes

      networkMode: 'online' as const,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },

    mutations: {
      networkMode: 'offlineFirst' as const,

      retry: (failureCount: number, error: unknown) => {
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes('Network') ||
            error.message.includes('connection'));

        if (isNetworkError && !onlineManager.isOnline()) {
          return failureCount < 5;
        }

        return failureCount < 2;
      },

      retryDelay: (attemptIndex: number) => {
        return Math.min(1000 * 2 ** attemptIndex, 60000);
      },
    },
  },

  mutationCache: createMutationCache(),
});

// Initialize online manager
setupOnlineManager();

/**
 * Query client instance
 */
export const queryClient = new QueryClient(getQueryClientConfig());

/**
 * Helper to get current network status
 */
export const getNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };
  } catch (error) {
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown',
    };
  }
};
