import { clsx } from 'clsx';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'flex-row items-center justify-center rounded-xl';
  const variants = {
    primary: 'bg-primary active:bg-primary/90',
    secondary: 'bg-gray-100 active:bg-gray-200 dark:bg-gray-800',
    outline: 'border border-gray-300 bg-transparent dark:border-gray-700',
    ghost: 'bg-transparent hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textStyles = clsx('font-semibold text-center', {
    'text-white': variant === 'primary',
    'text-gray-900 dark:text-white': variant !== 'primary',
    'text-sm': size === 'sm',
    'text-base': size === 'md',
    'text-lg': size === 'lg',
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      className={clsx(baseStyle, variants[variant], sizes[size], className, {
        'opacity-50': disabled || isLoading,
      })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : 'gray'}
          className="mr-2"
        />
      )}
      <Text className={textStyles}>{label}</Text>
    </TouchableOpacity>
  );
}
