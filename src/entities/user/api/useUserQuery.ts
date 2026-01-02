/**
 * User Query Hook
 * FSD Layer: Entities
 *
 * Fetches current user data from the API
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '@/shared/api';
import type { User } from '../model/types';

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async () => get<User>('/auth/me'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserQuery = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => get<User>(`/users/${userId}`),
    enabled: !!userId,
  });
};
