import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { loginUser } from '../api';
import { useAuthStore } from '../store';
import { useErrorHandler } from '@/hooks/useError';

export const useLogin = () => {
  const signIn = useAuthStore((state) => state.signIn);
  const router = useRouter();
  const { handleNetworkError } = useErrorHandler();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      signIn(data.token, data.user);
      router.replace('/(tabs)');
    },
    onError: handleNetworkError,
  });
};
