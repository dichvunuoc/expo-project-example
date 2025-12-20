import { QueryClient } from '@tanstack/react-query';
import { getQueryClientConfig, setupOnlineManager } from './online-manager';

// Initialize online manager for network status monitoring
setupOnlineManager();

// Create enhanced query client with offline support
export const queryClient = new QueryClient(getQueryClientConfig());
