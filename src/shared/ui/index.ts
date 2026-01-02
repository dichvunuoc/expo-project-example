/**
 * Shared UI Components (Public API)
 *
 * This is the public API for shared UI components.
 * All external imports should use this file.
 *
 * @example
 * import { Button, Input, Text, Modal, Toast, Badge } from '@/shared/ui';
 */

export { Button, type ButtonProps } from './button';
export {
  Input,
  ControlledInput,
  type InputProps,
  type ControlledInputProps,
} from './input';
export { Text, type TextProps } from './text';
export { Box, type BoxProps } from './box';
export { Card, type CardProps } from './card';
export { Icon, TabBarIcon, type IconProps, type TabBarIconProps } from './icon';
export {
  Modal,
  ConfirmModal,
  type ModalProps,
  type ConfirmModalProps,
} from './modal';
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastConfig,
  type ToastProps,
  type ToastProviderProps,
} from './toast';
export {
  Badge,
  NotificationBadge,
  StatusBadge,
  type BadgeProps,
  type NotificationBadgeProps,
  type StatusBadgeProps,
} from './badge';
