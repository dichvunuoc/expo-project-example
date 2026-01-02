import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../api', () => ({
  useSignInMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

// Mock Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

import { useSignInViewModel } from '../useSignInViewModel';
import { useSignInMutation } from '../../api';

describe('useSignInViewModel', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSignInMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  describe('initialization', () => {
    it('returns form, actions, and state', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current).toHaveProperty('form');
      expect(result.current).toHaveProperty('actions');
      expect(result.current).toHaveProperty('state');
    });

    it('returns form control and errors', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.form).toHaveProperty('control');
      expect(result.current.form).toHaveProperty('errors');
    });

    it('returns onSubmit action', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.actions).toHaveProperty('onSubmit');
      expect(typeof result.current.actions.onSubmit).toBe('function');
    });

    it('returns state properties', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.state).toHaveProperty('isPending');
      expect(result.current.state).toHaveProperty('isError');
      expect(result.current.state).toHaveProperty('error');
    });
  });

  describe('form state', () => {
    it('starts with empty form errors', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.form.errors).toEqual({});
    });

    it('has default form values', () => {
      const { result } = renderHook(() => useSignInViewModel());

      // Form control is provided
      expect(result.current.form.control).toBeDefined();
    });
  });

  describe('mutation state', () => {
    it('reflects isPending from mutation', () => {
      (useSignInMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.state.isPending).toBe(true);
    });

    it('reflects isError from mutation', () => {
      (useSignInMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: true,
        error: new Error('Auth failed'),
      });

      const { result } = renderHook(() => useSignInViewModel());

      expect(result.current.state.isError).toBe(true);
      expect(result.current.state.error).toBeInstanceOf(Error);
    });
  });

  describe('onSubmit action', () => {
    it('is callable', () => {
      const { result } = renderHook(() => useSignInViewModel());

      expect(() => {
        act(() => {
          result.current.actions.onSubmit();
        });
      }).not.toThrow();
    });
  });

  describe('MVVM pattern compliance', () => {
    it('does not expose internal form methods', () => {
      const { result } = renderHook(() => useSignInViewModel());

      // Should not expose handleSubmit directly
      expect(result.current).not.toHaveProperty('handleSubmit');
    });

    it('encapsulates mutation details', () => {
      const { result } = renderHook(() => useSignInViewModel());

      // Should not expose mutation object directly
      expect(result.current).not.toHaveProperty('signInMutation');
    });

    it('provides clean interface for View', () => {
      const { result } = renderHook(() => useSignInViewModel());

      // Only exposes what View needs
      const keys = Object.keys(result.current);
      expect(keys).toEqual(['form', 'actions', 'state']);
    });
  });
});
