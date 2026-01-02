import { TextInput, TextInputProps, View, Text } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const inputVariants = cva(
  'w-full bg-white dark:bg-gray-800 rounded-xl border dark:text-white',
  {
    variants: {
      variant: {
        default: 'border-gray-200 dark:border-gray-700',
        error: 'border-red-500 dark:border-red-400',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends
    Omit<TextInputProps, 'value' | 'onChangeText'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export function Input({
  label,
  error,
  variant,
  size,
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  className,
  ...props
}: InputProps) {
  const computedVariant = error ? 'error' : variant;

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
          inputVariants({ variant: computedVariant, size }),
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

// Controlled Input for React Hook Form integration
export interface ControlledInputProps<
  T extends FieldValues = FieldValues,
> extends Omit<InputProps, 'value' | 'onChangeText'> {
  name: FieldPath<T>;
  control: Control<T>;
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
