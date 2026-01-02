/**
 * Session Store (Zustand)
 * FSD Layer: Entities
 *
 * Manages authentication state (client state only)
 */

import type { User } from '@/entities/user';
import { configureAuth } from '@/shared/api';
import {
  createStorageInstance,
  createZustandStorageAdapter,
} from '@/shared/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create MMKV instance for this store
const storage = createStorageInstance({ id: 'session-storage' });

// Adapter for Zustand
const zustandStorage = createZustandStorageAdapter(storage);

interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  hydrate: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      signIn: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      signOut: () => {
        set({ token: null, user: null, isAuthenticated: false });
        storage.remove('session-storage');
      },

      hydrate: () => {
        set({ isHydrated: true });
        // Configure API client with token getter
        configureAuth(
          () => get().token,
          () => get().signOut()
        );
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        return () => state?.hydrate();
      },
    }
  )
);

// Initialize auth configuration when store is created
const initializeAuth = () => {
  const state = useSessionStore.getState();
  configureAuth(
    () => state.token,
    () => state.signOut()
  );
};

// Initialize on module load
initializeAuth();
