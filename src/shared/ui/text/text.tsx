import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const textVariants = cva('dark:text-white', {
  variants: {
    variant: {
      default: 'text-gray-900 dark:text-white',
      muted: 'text-gray-500 dark:text-gray-400',
      primary: 'text-primary',
      destructive: 'text-red-500',
      success: 'text-green-500',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    weight: 'normal',
  },
});

export interface TextProps
  extends RNTextProps, VariantProps<typeof textVariants> {}

export function Text({
  variant,
  size,
  weight,
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(textVariants({ variant, size, weight }), className)}
      {...props}
    />
  );
}
