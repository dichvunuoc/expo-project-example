import { useErrorHandler } from '@/hooks/useError';
import { act, renderHook } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../api';
import { useLogin } from './useLogin';

// Mock module-level functions
const mockSignIn = jest.fn();

// Mock all dependencies
jest.mock('../api');
jest.mock('expo-router');
jest.mock('@/hooks/useError');
jest.mock('../store', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      signIn: mockSignIn,
    };
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
}));

describe('useLogin', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockLoginResponse = {
    token: 'fake-jwt-token',
    user: mockUser,
    refreshToken: 'fake-refresh-token',
    expiresIn: 3600,
  };

  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockHandleNetworkError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useErrorHandler as jest.Mock).mockReturnValue({
      handleNetworkError: mockHandleNetworkError,
      handleError: jest.fn(),
      handleFormError: jest.fn(),
    });
  });

  it('should login successfully and navigate to tabs', async () => {
    // Arrange
    (loginUser as jest.Mock).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useLogin());

    // Act
    await act(async () => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Assert
    expect(loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(mockSignIn).toHaveBeenCalledWith('fake-jwt-token', mockUser);
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('should handle login error', async () => {
    // Arrange
    const mockError = new Error('Login failed');
    (loginUser as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogin());

    // Act
    await act(async () => {
      result.current.mutate({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });

    // Assert
    expect(loginUser).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockHandleNetworkError).toHaveBeenCalledWith(mockError);
  });

  it('should handle network error correctly', async () => {
    // Arrange
    const networkError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    (loginUser as jest.Mock).mockRejectedValue(networkError);

    const { result } = renderHook(() => useLogin());

    // Act
    await act(async () => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    });

    // Assert
    expect(mockHandleNetworkError).toHaveBeenCalledWith(networkError);
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
