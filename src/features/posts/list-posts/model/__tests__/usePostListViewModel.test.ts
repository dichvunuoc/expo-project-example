import { renderHook, act } from '@testing-library/react-native';

// Mock dependencies
const mockRefetch = jest.fn();
jest.mock('../../api', () => ({
  usePostsQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    isRefetching: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

import { usePostListViewModel } from '../usePostListViewModel';
import { usePostsQuery } from '../../api';

describe('usePostListViewModel', () => {
  const mockPosts = [
    { id: 1, title: 'Post 1', body: 'Content 1', userId: 1 },
    { id: 2, title: 'Post 2', body: 'Content 2', userId: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostsQuery as jest.Mock).mockReturnValue({
      data: mockPosts,
      isLoading: false,
      isError: false,
      isRefetching: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  describe('initialization', () => {
    it('returns data, actions, and state', () => {
      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('actions');
      expect(result.current).toHaveProperty('state');
    });

    it('returns posts in data', () => {
      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.data).toHaveProperty('posts');
    });

    it('returns onRefresh action', () => {
      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.actions).toHaveProperty('onRefresh');
      expect(typeof result.current.actions.onRefresh).toBe('function');
    });

    it('returns all state properties', () => {
      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.state).toHaveProperty('isLoading');
      expect(result.current.state).toHaveProperty('isError');
      expect(result.current.state).toHaveProperty('isRefetching');
      expect(result.current.state).toHaveProperty('error');
    });
  });

  describe('data', () => {
    it('provides posts from query', () => {
      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.data.posts).toEqual(mockPosts);
    });

    it('handles undefined posts', () => {
      (usePostsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        isRefetching: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.data.posts).toBeUndefined();
    });
  });

  describe('state', () => {
    it('reflects loading state', () => {
      (usePostsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        isRefetching: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.state.isLoading).toBe(true);
    });

    it('reflects error state', () => {
      const mockError = new Error('Failed to fetch');
      (usePostsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        isRefetching: false,
        error: mockError,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.state.isError).toBe(true);
      expect(result.current.state.error).toBe(mockError);
    });

    it('reflects refetching state', () => {
      (usePostsQuery as jest.Mock).mockReturnValue({
        data: mockPosts,
        isLoading: false,
        isError: false,
        isRefetching: true,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePostListViewModel());

      expect(result.current.state.isRefetching).toBe(true);
    });
  });

  describe('actions', () => {
    it('onRefresh calls refetch', () => {
      const { result } = renderHook(() => usePostListViewModel());

      act(() => {
        result.current.actions.onRefresh();
      });

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('onRefresh is memoized', () => {
      const { result, rerender } = renderHook(() => usePostListViewModel());

      const firstOnRefresh = result.current.actions.onRefresh;
      rerender({});
      const secondOnRefresh = result.current.actions.onRefresh;

      // Should be the same reference due to useCallback
      expect(firstOnRefresh).toBe(secondOnRefresh);
    });
  });

  describe('MVVM pattern compliance', () => {
    it('provides clean interface for View', () => {
      const { result } = renderHook(() => usePostListViewModel());

      const keys = Object.keys(result.current);
      expect(keys).toEqual(['data', 'actions', 'state']);
    });

    it('encapsulates query implementation', () => {
      const { result } = renderHook(() => usePostListViewModel());

      // Should not expose query object directly
      expect(result.current).not.toHaveProperty('postsQuery');
    });
  });
});
