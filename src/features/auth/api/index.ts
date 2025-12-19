import apiClient from '@/lib/axios';
import { AuthResponse, LoginCredentials } from '../types';

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  // Mock API call for demo purposes because we don't have a real backend
  // return apiClient.post('/auth/login', credentials).then(res => res.data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'fake-jwt-token',
        user: {
          id: '1',
          email: credentials.email,
          name: 'Demo User',
        },
      });
    }, 1000);
  });
};

export const registerUser = async (userData: any) => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};
