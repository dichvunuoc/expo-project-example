import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from './useAuth';
import { User } from '../types';

// Mock the entire store module
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

jest.mock('../store', () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isHydrated: false,
    signIn: mockSignIn,
    signOut: mockSignOut,
  }),
}));

describe('useAuth', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return auth state with default values', () => {
    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isHydrated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should call signIn when login is called', () => {
    // Act
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.login('test-token', mockUser);
    });

    // Assert
    expect(mockSignIn).toHaveBeenCalledWith('test-token', mockUser);
  });

  it('should call signOut when logout is called', () => {
    // Act
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });

    // Assert
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle login error case', () => {
    // Arrange
    mockSignIn.mockImplementation(() => {
      throw new Error('Login failed');
    });

    // Act & Assert
    const { result } = renderHook(() => useAuth());
    expect(() => {
      act(() => {
        result.current.login('invalid-token', mockUser);
      });
    }).toThrow('Login failed');
  });
});
