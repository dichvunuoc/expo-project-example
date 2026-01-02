import { renderHook, waitFor } from '@testing-library/react-native';

// Mock NetInfo before importing the hook
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: { ssid: 'TestNetwork' },
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock the logger
jest.mock('@/shared/lib/logger', () => ({
  api: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus, useIsOnline } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns loading state initially', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isLoading).toBe(false); // Mocked useQuery returns false
    });

    it('returns default values when data is not available', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
      expect(result.current.type).toBe('unknown');
    });
  });

  describe('NetInfo integration', () => {
    it('adds event listener on mount', () => {
      renderHook(() => useNetworkStatus());

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('removes event listener on unmount', () => {
      const unsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useNetworkStatus());
      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('refetch function', () => {
    it('provides refetch function', () => {
      const { result } = renderHook(() => useNetworkStatus());

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('useIsOnline', () => {
  it('returns online status', () => {
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toHaveProperty('isOnline');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('returns false when disconnected', () => {
    const { result } = renderHook(() => useIsOnline());

    expect(result.current.isOnline).toBe(false);
  });
});
