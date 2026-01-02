/**
 * NetworkStatusIndicator Widget
 * FSD Layer: Widgets
 *
 * Displays network connection status to the user
 */

import { Text } from '@/shared/ui';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function NetworkStatusIndicator() {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
      });
    });

    return unsubscribe;
  }, []);

  // Show when syncing
  if (isSyncing) {
    return (
      <View
        className="absolute left-0 right-0 z-50 items-center bg-blue-500 p-2"
        style={{ top: insets.top }}
      >
        <Text className="text-white text-xs font-bold">
          Syncing offline data...
        </Text>
      </View>
    );
  }

  // Don't show when connected
  if (networkState.isConnected && networkState.isInternetReachable) {
    return null;
  }

  return (
    <View
      className="absolute left-0 right-0 z-50 items-center bg-[#ff6b6b] p-2"
      style={{ top: insets.top }}
    >
      <Text className="text-white text-xs font-bold">
        {networkState.isConnected && !networkState.isInternetReachable
          ? 'No Internet Connection'
          : 'Offline Mode - Data will sync when online'}
      </Text>
    </View>
  );
}
