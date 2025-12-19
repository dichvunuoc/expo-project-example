import { useCallback } from 'react';
import { useAuthStore } from '../store';
import { User } from '../types';

export const useAuth = () => {
  const { user, token, isAuthenticated, isHydrated, signIn, signOut } =
    useAuthStore();

  const login = useCallback(
    (tokenValue: string, userValue: User) => {
      signIn(tokenValue, userValue);
    },
    [signIn]
  );

  const logout = useCallback(() => {
    signOut();
  }, [signOut]);

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
    login,
    logout,
  };
};
