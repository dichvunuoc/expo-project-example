import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { View, Animated, TouchableOpacity, type ViewStyle } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';
import { Text } from '../text';

const toastVariants = cva(
  'flex-row items-center p-4 rounded-xl mx-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 dark:bg-gray-100',
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-500',
        info: 'bg-blue-600',
      },
      position: {
        top: '',
        bottom: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'bottom',
    },
  }
);

const toastTextVariants = cva('flex-1', {
  variants: {
    variant: {
      default: 'text-white dark:text-gray-900',
      success: 'text-white',
      error: 'text-white',
      warning: 'text-gray-900',
      info: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const toastIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export interface ToastConfig {
  /**
   * Unique identifier for the toast
   */
  id: string;
  /**
   * Toast message content
   */
  message: string;
  /**
   * Toast variant style
   * @default 'default'
   */
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  /**
   * Duration in milliseconds before auto-dismiss
   * @default 3000
   */
  duration?: number;
  /**
   * Whether toast can be dismissed by user
   * @default true
   */
  dismissible?: boolean;
  /**
   * Optional action button
   */
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ToastProps extends ToastConfig {
  onDismiss: (id: string) => void;
  style?: Animated.WithAnimatedValue<ViewStyle>;
}

export function Toast({
  id,
  message,
  variant = 'default',
  dismissible = true,
  action,
  onDismiss,
  style,
}: ToastProps) {
  const icon = variant !== 'default' ? toastIcons[variant] : null;

  return (
    <Animated.View
      style={style}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${variant !== 'default' ? variant + ' notification: ' : ''}${message}`}
    >
      <View className={cn(toastVariants({ variant }))}>
        {icon && <Text className="mr-3 text-lg text-white">{icon}</Text>}
        <Text className={cn(toastTextVariants({ variant }), 'font-medium')}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            className="ml-3 px-3 py-1 rounded-lg bg-white/20"
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text className="text-white font-semibold">{action.label}</Text>
          </TouchableOpacity>
        )}
        {dismissible && (
          <TouchableOpacity
            onPress={() => onDismiss(id)}
            className="ml-2 p-1"
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <Text className="text-white/80 text-lg">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// Toast Context and Provider
type ToastPosition = 'top' | 'bottom';

interface ToastContextValue {
  show: (config: Omit<ToastConfig, 'id'>) => string;
  success: (
    message: string,
    options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
  ) => string;
  error: (
    message: string,
    options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
  ) => string;
  warning: (
    message: string,
    options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
  ) => string;
  info: (
    message: string,
    options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  /**
   * Position of toasts on screen
   * @default 'bottom'
   */
  position?: ToastPosition;
  /**
   * Maximum number of toasts visible at once
   * @default 3
   */
  maxVisible?: number;
}

interface ToastState extends ToastConfig {
  animation: Animated.Value;
}

export function ToastProvider({
  children,
  position = 'bottom',
  maxVisible = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toastIdRef = useRef(0);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = useCallback((id: string) => {
    setToasts((current) => {
      const toast = current.find((t) => t.id === id);
      if (toast) {
        Animated.timing(toast.animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setToasts((c) => c.filter((t) => t.id !== id));
        });
      }
      return current;
    });

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (config: Omit<ToastConfig, 'id'>): string => {
      const id = `toast-${++toastIdRef.current}`;
      const animation = new Animated.Value(0);
      const duration = config.duration ?? 3000;

      const newToast: ToastState = {
        ...config,
        id,
        animation,
      };

      setToasts((current) => {
        const updated = [...current, newToast];
        // Remove oldest if exceeding max
        if (updated.length > maxVisible) {
          const removed = updated.shift();
          if (removed) {
            dismiss(removed.id);
          }
        }
        return updated;
      });

      // Animate in
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss, maxVisible]
  );

  const success = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
    ) => show({ message, variant: 'success', ...options }),
    [show]
  );

  const error = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
    ) => show({ message, variant: 'error', ...options }),
    [show]
  );

  const warning = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
    ) => show({ message, variant: 'warning', ...options }),
    [show]
  );

  const info = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastConfig, 'id' | 'message' | 'variant'>>
    ) => show({ message, variant: 'info', ...options }),
    [show]
  );

  const dismissAll = useCallback(() => {
    toasts.forEach((t) => dismiss(t.id));
  }, [toasts, dismiss]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const contextValue: ToastContextValue = {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        className={cn(
          'absolute left-0 right-0 z-50',
          position === 'top' ? 'top-12' : 'bottom-12'
        )}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={dismiss}
            style={{
              opacity: toast.animation,
              transform: [
                {
                  translateY: toast.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [position === 'top' ? -20 : 20, 0],
                  }),
                },
              ],
              marginBottom: 8,
            }}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functions
 * Must be used within a ToastProvider
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
