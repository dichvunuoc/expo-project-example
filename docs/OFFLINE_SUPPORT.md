# Offline Support with TanStack Query

This document explains the offline support implementation using TanStack Query and NetInfo.

## 🌐 Architecture Overview

The offline support system consists of:

1. **NetInfo Integration** - Monitors network connectivity
2. **TanStack Query Online Manager** - Manages query execution based on network status
3. **Enhanced Mutation Cache** - Handles offline mutations with retry logic
4. **Network Status Hook** - Provides real-time network status to components

## 🔧 Implementation Details

### 1. Online Manager Configuration

**File: `src/lib/online-manager.ts`**

The online manager is configured to:

- **Monitor network status** using NetInfo
- **Pause queries** when offline
- **Resume queries** when network is restored
- **Log network status changes** for debugging
- **Trigger refetch** on network restoration

```typescript
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const isOnline = state.isConnected ?? false;
    setOnline(isOnline);

    // Log and handle network changes
    if (isOnline) {
      focusManager.setFocused(true); // Trigger refetch
    }
  });
});
```

### 2. Query Client Configuration

Enhanced query client with offline support:

```typescript
const config = {
  defaultOptions: {
    queries: {
      networkMode: 'online', // Only run when online
      retry: (failureCount, error) => {
        // Don't retry network errors immediately
        const isNetworkError = /* check error type */;
        return isNetworkError ? false : failureCount < 3;
      },
      refetchOnReconnect: true, // Auto-refetch when online
    },
    mutations: {
      networkMode: 'offlineFirst', // Try even when offline
      retry: (failureCount, error) => {
        // More retries for network errors when offline
        return failureCount < 5;
      },
    },
  },
};
```

### 3. Network Modes Explained

#### `networkMode: 'online'` (Default for Queries)

- **Only runs when online**
- **Pauses when offline**
- **Resumes when network restores**
- **Perfect for data fetching**

#### `networkMode: 'offlineFirst'` (Default for Mutations)

- **Tries even when offline**
- **Queues mutations when offline**
- **Retries when network restores**
- **Perfect for form submissions**

#### `networkMode: 'always'`

- **Always runs regardless of network status**
- **Useful for local-only operations**

## 📱 Usage Examples

### Basic Query with Offline Support

```typescript
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data, isLoading, error, isPaused } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
    // Uses default configuration from query client
    // networkMode: 'online' - will pause when offline
  });

  if (isPaused) {
    return <Text>Offline - loading when connection is available...</Text>;
  }

  // Rest of component logic
}
```

### Mutation with Offline Queuing

```typescript
import { useMutation } from '@tanstack/react-query';

function CreatePostForm() {
  const mutation = useMutation({
    mutationFn: createPost,
    // Uses default configuration from query client
    // networkMode: 'offlineFirst' - will queue when offline
    onSuccess: () => {
      toast.success('Post created!');
    },
    onError: (error) => {
      if (error.message.includes('Network')) {
        toast.info('Post will be created when connection is available');
      }
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### Network Status in Components

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function NetworkAwareComponent() {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  return (
    <View>
      {isConnected && isInternetReachable ? (
        <Text>🟢 Online</Text>
      ) : isConnected ? (
        <Text>🟡 Connected but no internet</Text>
      ) : (
        <Text>🔴 Offline</Text>
      )}
    </View>
  );
}
```

## 🔄 Offline-First Strategy

### Data Caching

Configure appropriate cache times for different data types:

```typescript
const queryOptions = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 60, // 1 hour (keep in cache)
};
```

### Optimistic Updates

Provide immediate UI feedback even when offline:

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

## ⚡ Performance Optimizations

### 1. Background Sync

```typescript
import { focusManager } from '@tanstack/react-query';

// Auto-refetch when app comes to foreground
focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (state) => {
    setFocused(state === 'active');
  });

  return () => subscription.remove();
});
```

### 2. Selective Refetching

```typescript
// Only refetch critical data when online
const criticalQueries = ['user', 'notifications'];

criticalQueries.forEach((queryKey) => {
  queryClient.invalidateQueries({ queryKey });
});
```

### 3. Prefetching Strategy

```typescript
// Prefetch data when online
useEffect(() => {
  if (isOnline) {
    queryClient.prefetchQuery({
      queryKey: ['user', 'preferences'],
      queryFn: fetchUserPreferences,
    });
  }
}, [isOnline]);
```

## 🐛 Debugging Offline Issues

### 1. Check Query Status

```typescript
const { data, status, fetchStatus, isPaused } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

console.log({
  status, // 'pending', 'error', 'success'
  fetchStatus, // 'fetching', 'paused', 'idle'
  isPaused, // true when offline
});
```

### 2. Network Status Logs

All network changes are logged with structured information:

```typescript
// Check logs for:
// - Network status changes
// - Query pause/resume events
// - Mutation queueing/retries
```

### 3. DevTools Integration

TanStack Query DevTools show:

- Paused queries (grayed out)
- Offline status
- Mutation queue status

## 🔧 Configuration Options

### Global Configuration (query-client.ts)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'online',
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});
```

### Per-Query Configuration

```typescript
// Override global settings per query
useQuery({
  queryKey: ['critical-data'],
  queryFn: fetchCriticalData,
  networkMode: 'always', // Always try
  refetchInterval: 30000, // More frequent
});
```

## 📊 Testing Offline Scenarios

### 1. Simulate Offline Mode

```typescript
// For testing only
import { onlineManager } from '@tanstack/react-query';

// Force offline mode
onlineManager.setOnline(false);

// Force online mode
onlineManager.setOnline(true);
```

### 2. Test Mutation Queue

```typescript
// Test offline mutations
test('mutations are queued when offline', async () => {
  onlineManager.setOnline(false);

  const mutation = useMutation({ mutationFn: createPost });
  mutation.mutate({ title: 'Test Post' });

  expect(mutation.status).toBe('pending');

  onlineManager.setOnline(true);
  await waitFor(() => expect(mutation.isSuccess).toBe(true));
});
```

## 🚀 Best Practices

### ✅ DO

- Use `networkMode: 'online'` for data fetching
- Use `networkMode: 'offlineFirst'` for mutations
- Implement optimistic updates
- Show network status to users
- Cache data appropriately
- Test offline scenarios

### ❌ DON'T

- Ignore offline state in UI
- Assume network is always available
- Cache sensitive data indefinitely
- Forget about error handling
- Ignore mutation retry logic

## 🔍 Troubleshooting

### Common Issues

1. **Queries not refetching when online**
   - Check `refetchOnReconnect: true`
   - Verify online manager setup
   - Check network status logs

2. **Mutations not retrying**
   - Verify `networkMode: 'offlineFirst'`
   - Check retry configuration
   - Look for mutation cache errors

3. **App performance issues**
   - Reduce `refetchInterval`
   - Increase `staleTime`
   - Use selective invalidation

### Debug Tools

- TanStack Query DevTools
- React Native Debugger
- Network status logs
- Console debugging

---

**Remember: Good offline support requires thinking about the user experience first. Always provide feedback about network status!**
