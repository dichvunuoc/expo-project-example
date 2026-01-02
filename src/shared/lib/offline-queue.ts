/**
 * Offline Queue Management
 * FSD Layer: Shared
 */

import { storageService } from '@/shared/lib/storage';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Mutation variables type - generic record for flexibility
 */
export type MutationVariables = Record<string, unknown>;

// --- TS Interface ---
export interface OfflineMutation {
  id: string;
  mutationKey: string; // Using string for simplicity, or can be JSON stringified array
  variables: MutationVariables;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'offline_queue_v1';

// --- OfflineQueue Class ---
export class OfflineQueue {
  /**
   * Get the current queue from Storage
   */
  async getQueue(): Promise<OfflineMutation[]> {
    const queue =
      await storageService.get<OfflineMutation[]>(OFFLINE_QUEUE_KEY);
    return queue || [];
  }

  /**
   * Add a new mutation to the queue
   */
  async add(
    mutationKey: string,
    variables: MutationVariables
  ): Promise<OfflineMutation> {
    const queue = await this.getQueue();

    const newItem: OfflineMutation = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      mutationKey,
      variables,
      timestamp: Date.now(),
    };

    queue.push(newItem);
    await storageService.set(OFFLINE_QUEUE_KEY, queue);

    return newItem;
  }

  /**
   * Remove a mutation from the queue by ID
   */
  async remove(id: string): Promise<void> {
    const queue = await this.getQueue();
    const newQueue = queue.filter((item) => item.id !== id);
    await storageService.set(OFFLINE_QUEUE_KEY, newQueue);
  }

  /**
   * Clear the entire queue
   */
  async clear(): Promise<void> {
    await storageService.remove(OFFLINE_QUEUE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();

// --- Sync Logic ---

/**
 * Mutation executor function type
 */
type MutationExecutor = (mutation: OfflineMutation) => Promise<unknown>;

/**
 * Sync options configuration
 */
interface SyncOptions {
  executor: MutationExecutor;
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onMutationSuccess?: (item: OfflineMutation, result: unknown) => void;
  onMutationError?: (item: OfflineMutation, error: unknown) => void;
}

/**
 * Syncs the offline queue when the device goes online.
 *
 * @param options Configuration for execution and callbacks
 * @returns Unsubscribe function for NetInfo listener
 */
export function syncWhenOnline(options: SyncOptions) {
  // Setup React Query Online Manager
  onlineManager.setEventListener((setOnline: (online: boolean) => void) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });

  // Listen for network changes to trigger queue processing
  const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      await processQueue(options);
    }
  });

  return unsubscribe;
}

/**
 * Process the queue items sequentially
 */
export async function processQueue(options: SyncOptions) {
  const queue = await offlineQueue.getQueue();

  if (queue.length === 0) return;

  options.onSyncStart?.();

  // Clone queue to avoid mutation issues during iteration if we re-fetch
  const currentQueue = [...queue];

  for (const item of currentQueue) {
    try {
      const result = await options.executor(item);

      // If successful, remove from queue
      await offlineQueue.remove(item.id);
      options.onMutationSuccess?.(item, result);
    } catch (error) {
      console.error(`Failed to process offline mutation ${item.id}:`, error);
      options.onMutationError?.(item, error);
      // Decide logic: maintain in queue if temporary network error?
      // For now, we simply keep it in queue to retry next time.
    }
  }

  // Check if queue is empty after processing
  const remainingParams = await offlineQueue.getQueue();
  if (remainingParams.length === 0) {
    options.onSyncComplete?.();
  }
}
