import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl active:opacity-90',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-gray-100 dark:bg-gray-800',
        outline: 'border border-gray-300 bg-transparent dark:border-gray-700',
        ghost: 'bg-transparent',
        destructive: 'bg-red-500',
      },
      size: {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const buttonTextVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-gray-900 dark:text-white',
      outline: 'text-gray-900 dark:text-white',
      ghost: 'text-gray-900 dark:text-white',
      destructive: 'text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  label: string;
  isLoading?: boolean;
}

export function Button({
  variant,
  size,
  className,
  label,
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'destructive'
              ? 'white'
              : 'gray'
          }
          className="mr-2"
        />
      )}
      <Text className={cn(buttonTextVariants({ variant, size }))}>{label}</Text>
    </TouchableOpacity>
  );
}
