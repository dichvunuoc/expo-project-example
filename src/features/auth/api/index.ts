import apiClient from '@/lib/axios';
import {
  AuthResponse,
  LoginCredentials,
  RegisterUserData,
  ResetPasswordData,
  ChangePasswordData,
  User,
} from '../types';

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  // Mock API call for demo purposes because we don't have a real backend
  // return apiClient.post('/auth/login', credentials).then(res => res.data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        expiresIn: 3600,
        user: {
          id: '1',
          email: credentials.email,
          name: 'Demo User',
          createdAt: new Date().toISOString(),
        },
      });
    }, 1000);
  });
};

export const registerUser = async (
  userData: RegisterUserData
): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};

export const refreshToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return data;
};

export const resetPassword = async (
  resetData: ResetPasswordData
): Promise<{ message: string }> => {
  const { data } = await apiClient.post('/auth/reset-password', resetData);
  return data;
};

export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<{ message: string }> => {
  const { data } = await apiClient.post('/auth/change-password', passwordData);
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const logout = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.post('/auth/logout');
  return data;
};
