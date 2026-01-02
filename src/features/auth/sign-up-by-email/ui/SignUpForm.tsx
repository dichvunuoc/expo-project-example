/**
 * SignUpForm Component
 * FSD Layer: Features
 *
 * Form UI for email/password registration
 */

import { Alert, View } from 'react-native';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Button, ControlledInput, Text } from '@/shared/ui';
import { useSignUpMutation } from '../api';
import { signUpSchema, type SignUpFormData } from '../model';

export function SignUpForm() {
  const signUpMutation = useSignUpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = (data: SignUpFormData) => {
    signUpMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  const onError = (errors: FieldErrors<SignUpFormData>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      Alert.alert('Validation Error', firstError.message);
    }
  };

  return (
    <View className="w-full max-w-sm space-y-4">
      <Text size="3xl" weight="bold" className="text-center mb-8">
        Create Account
      </Text>

      <View className="space-y-4">
        <ControlledInput
          label="Name"
          placeholder="Enter your name"
          control={control}
          name="name"
          autoCapitalize="words"
        />

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

        <ControlledInput
          label="Confirm Password"
          placeholder="Confirm your password"
          control={control}
          name="confirmPassword"
          secureTextEntry
        />
      </View>

      <Button
        label="Sign Up"
        onPress={handleSubmit(handleSignUp, onError)}
        isLoading={signUpMutation.isPending}
        className="mt-6"
      />

      <View className="flex-row justify-center mt-4">
        <Text variant="muted">Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Text variant="primary" weight="semibold">
            Sign In
          </Text>
        </Link>
      </View>
    </View>
  );
}
