/**
 * Query Provider
 * FSD Layer: App
 *
 * Provides TanStack Query context to the application
 */

import { queryClient } from '@/shared/api';
import { QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
