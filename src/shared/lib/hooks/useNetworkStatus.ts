import { error as errorLogger, info as infoLogger } from '@/shared/lib/logger';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

// Network status query key
const NETWORK_STATUS_QUERY_KEY = ['network', 'status'];

// Network status query function
const fetchNetworkStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      details: state.details,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    errorLogger(
      'Failed to fetch network status',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      } as Record<string, unknown>,
      {
        component: 'useNetworkStatus',
        action: 'FETCH_ERROR',
      }
    );

    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown' as const,
      details: null,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Hook for monitoring network status with TanStack Query
 */
export const useNetworkStatus = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: NETWORK_STATUS_QUERY_KEY,
    queryFn: fetchNetworkStatus,
    staleTime: 1000, // Consider network status stale after 1 second
    refetchInterval: 5000, // Refetch every 5 seconds
    networkMode: 'always', // Always try to fetch network status
    retry: false, // Don't retry network status queries
  });

  useEffect(() => {
    // Set up NetInfo listener for real-time updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;

      // Update TanStack Query online manager
      onlineManager.setOnline(isOnline);

      // Invalidate query to trigger refetch
      refetch();

      infoLogger(
        `Network status updated: ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
        {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
        } as Record<string, unknown>,
        {
          component: 'useNetworkStatus',
          action: 'STATUS_UPDATE',
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [refetch]);

  return {
    isConnected: data?.isConnected ?? false,
    isInternetReachable: data?.isInternetReachable ?? false,
    type: data?.type ?? 'unknown',
    details: data?.details,
    timestamp: data?.timestamp,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for checking if device is online with caching
 */
export const useIsOnline = () => {
  const { isConnected, isLoading } = useNetworkStatus();

  return {
    isOnline: isConnected,
    isLoading,
  };
};

export default useNetworkStatus;
