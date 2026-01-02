/**
 * SignInForm Component
 * FSD Layer: Features
 *
 * Form UI for email/password sign in
 */

import { Alert, View } from 'react-native';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Button, ControlledInput, Text } from '@/shared/ui';
import { useSignInMutation } from '../api';
import { signInSchema, type SignInFormData } from '../model';

export function SignInForm() {
  const signInMutation = useSignInMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = (data: SignInFormData) => {
    signInMutation.mutate(data);
  };

  const onError = (errors: FieldErrors<SignInFormData>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      Alert.alert('Validation Error', firstError.message);
    }
  };

  return (
    <View className="w-full max-w-sm space-y-4">
      <Text size="3xl" weight="bold" className="text-center mb-8">
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
        onPress={handleSubmit(handleSignIn, onError)}
        isLoading={signInMutation.isPending}
        className="mt-6"
      />

      <View className="flex-row justify-center mt-4">
        <Text variant="muted">Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Text variant="primary" weight="semibold">
            Sign Up
          </Text>
        </Link>
      </View>
    </View>
  );
}
