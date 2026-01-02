/**
 * Query Provider
 * FSD Layer: App
 *
 * Provides TanStack Query context to the application
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
