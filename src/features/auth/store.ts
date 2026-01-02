import {
  createStorageInstance,
  createZustandStorageAdapter,
} from '@/shared/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type User } from './types';

// Create MMKV instance for this store
const storage = createStorageInstance({ id: 'auth-storage' });

// Adapter for Zustand
const zustandStorage = createZustandStorageAdapter(storage);

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      signIn: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },
      signOut: () => {
        set({ token: null, user: null, isAuthenticated: false });
        storage.remove('auth-storage'); // Optional: Clear specific key
      },
      hydrate: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        return () => state?.hydrate();
      },
    }
  )
);
