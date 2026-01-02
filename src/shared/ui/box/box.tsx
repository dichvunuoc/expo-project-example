import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const boxVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-white dark:bg-gray-800',
      muted: 'bg-gray-50 dark:bg-gray-900',
      transparent: 'bg-transparent',
      error: 'bg-red-50 dark:bg-red-900/20',
      success: 'bg-green-50 dark:bg-green-900/20',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    },
    padding: {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    border: {
      none: '',
      default: 'border border-gray-200 dark:border-gray-700',
      primary: 'border border-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
    rounded: 'lg',
    padding: 'md',
    border: 'none',
  },
});

export interface BoxProps extends ViewProps, VariantProps<typeof boxVariants> {}

export function Box({
  variant,
  rounded,
  padding,
  border,
  className,
  ...props
}: BoxProps) {
  return (
    <View
      className={cn(
        boxVariants({ variant, rounded, padding, border }),
        className
      )}
      {...props}
    />
  );
}
