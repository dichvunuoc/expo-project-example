import { TextInput, TextInputProps, View, Text } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

interface ControlledInputProps<
  T extends FieldValues = FieldValues,
> extends InputProps {
  name: FieldPath<T>;
  control: Control<T>;
}

export function Input({
  label,
  error,
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  className,
  ...props
}: InputProps) {
  return (
    <View className={cn('space-y-2', containerClassName)}>
      {label && (
        <Text
          className={cn('mb-2 font-medium dark:text-gray-300', labelClassName)}
        >
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-white',
          error && 'border-red-500 dark:border-red-400',
          inputClassName || className
        )}
        placeholderTextColor={error ? '#ef4444' : '#9ca3af'}
        {...props}
      />
      {error && (
        <Text className={cn('text-red-500 text-sm mt-1', errorClassName)}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function ControlledInput<T extends FieldValues = FieldValues>({
  name,
  control,
  ...props
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Input
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
