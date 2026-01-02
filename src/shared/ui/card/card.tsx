import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const cardVariants = cva(
  'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-md',
        outlined: 'border-2',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends ViewProps, VariantProps<typeof cardVariants> {}

export function Card({ variant, padding, className, ...props }: CardProps) {
  return (
    <View
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}
