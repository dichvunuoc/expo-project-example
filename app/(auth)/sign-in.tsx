import { Button } from '@/components/ui/Button';
import { ControlledInput } from '@/components/ui/Input';
import { useLogin } from '@/features/auth/hooks/useLogin';
import {
  loginSchema,
  type LoginFormData,
} from '@/features/auth/schemas/auth.schema';
import { Link, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Text, View } from 'react-native';

export default function SignInScreen() {
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      Alert.alert('Validation Error', firstError.message);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Stack.Screen options={{ title: 'Sign In' }} />

      <View className="w-full max-w-sm space-y-4">
        <Text className="text-3xl font-bold text-center mb-8 dark:text-white">
          Welcome Back
        </Text>

        <View className="space-y-4">
          <ControlledInput
            label="Email"
            placeholder="Enter your email"
            control={control}
            name="email"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <ControlledInput
            label="Password"
            placeholder="Enter your password"
            control={control}
            name="password"
            secureTextEntry
          />
        </View>

        <Button
          label="Sign In"
          onPress={handleSubmit(handleLogin, onError)}
          isLoading={loginMutation.isPending}
          className="mt-6"
        />

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Text className="text-primary font-semibold">Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
