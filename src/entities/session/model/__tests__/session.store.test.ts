import { act } from '@testing-library/react-native';

// Mock MMKV
const mockStorage = new Map<string, string>();
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn((key: string, value: string) => mockStorage.set(key, value)),
    getString: jest.fn((key: string) => mockStorage.get(key)),
    remove: jest.fn((key: string) => mockStorage.delete(key)),
    clearAll: jest.fn(() => mockStorage.clear()),
  })),
}));

// Mock the API configuration
jest.mock('@/shared/api', () => ({
  configureAuth: jest.fn(),
}));

import { useSessionStore } from '../session.store';
import { configureAuth } from '@/shared/api';

describe('SessionStore', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset store to initial state
    const store = useSessionStore.getState();
    store.signOut();
    mockStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null user initially', () => {
      const state = useSessionStore.getState();
      expect(state.user).toBeNull();
    });

    it('has null token initially', () => {
      const state = useSessionStore.getState();
      expect(state.token).toBeNull();
    });

    it('is not authenticated initially', () => {
      const state = useSessionStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('signIn', () => {
    it('sets user on sign in', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
      });

      const state = useSessionStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('sets token on sign in', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
      });

      const state = useSessionStore.getState();
      expect(state.token).toBe('test-token');
    });

    it('sets isAuthenticated to true on sign in', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
      });

      const state = useSessionStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('signOut', () => {
    it('clears user on sign out', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
        useSessionStore.getState().signOut();
      });

      const state = useSessionStore.getState();
      expect(state.user).toBeNull();
    });

    it('clears token on sign out', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
        useSessionStore.getState().signOut();
      });

      const state = useSessionStore.getState();
      expect(state.token).toBeNull();
    });

    it('sets isAuthenticated to false on sign out', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
        useSessionStore.getState().signOut();
      });

      const state = useSessionStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('updates user data', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
        useSessionStore.getState().updateUser({ name: 'Updated Name' });
      });

      const state = useSessionStore.getState();
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe('test@example.com'); // Other fields preserved
    });

    it('does nothing if user is null', () => {
      act(() => {
        useSessionStore.getState().updateUser({ name: 'Updated Name' });
      });

      const state = useSessionStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('hydrate', () => {
    it('sets isHydrated to true', () => {
      act(() => {
        useSessionStore.getState().hydrate();
      });

      const state = useSessionStore.getState();
      expect(state.isHydrated).toBe(true);
    });

    it('configures API auth', () => {
      act(() => {
        useSessionStore.getState().hydrate();
      });

      expect(configureAuth).toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('can select specific state slices', () => {
      act(() => {
        useSessionStore.getState().signIn('test-token', mockUser);
      });

      const isAuthenticated = useSessionStore.getState().isAuthenticated;
      expect(isAuthenticated).toBe(true);
    });
  });
});
