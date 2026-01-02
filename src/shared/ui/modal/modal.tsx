import { cn } from '@/shared/lib/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  type ModalProps as RNModalProps,
} from 'react-native';
import { Text } from '../text';

const modalContainerVariants = cva(
  'bg-white dark:bg-gray-900 rounded-2xl overflow-hidden',
  {
    variants: {
      size: {
        sm: 'w-[280px]',
        md: 'w-[320px]',
        lg: 'w-[90%] max-w-[400px]',
        full: 'w-[95%] max-h-[90%]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const modalHeaderVariants = cva('flex-row items-center justify-between p-4', {
  variants: {
    variant: {
      default: 'border-b border-gray-200 dark:border-gray-700',
      transparent: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ModalProps
  extends
    Omit<RNModalProps, 'visible'>,
    VariantProps<typeof modalContainerVariants> {
  /**
   * Controls whether the modal is visible
   */
  isOpen: boolean;
  /**
   * Callback when modal is closed
   */
  onClose: () => void;
  /**
   * Modal title displayed in header
   */
  title?: string;
  /**
   * Whether to show close button in header
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether to close modal when backdrop is pressed
   * @default true
   */
  closeOnBackdrop?: boolean;
  /**
   * Header variant style
   * @default 'default'
   */
  headerVariant?: 'default' | 'transparent';
  /**
   * Custom header content (overrides title)
   */
  headerContent?: React.ReactNode;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Additional class name for modal container
   */
  containerClassName?: string;
  /**
   * Additional class name for modal content area
   */
  contentClassName?: string;
  /**
   * Accessibility label for the modal
   */
  accessibilityLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  closeOnBackdrop = true,
  headerVariant = 'default',
  headerContent,
  footer,
  children,
  size,
  containerClassName,
  contentClassName,
  accessibilityLabel,
  ...props
}: ModalProps) {
  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const showHeader = title || headerContent || showCloseButton;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
      accessibilityLabel={accessibilityLabel || title || 'Modal dialog'}
      {...props}
    >
      <TouchableWithoutFeedback
        onPress={handleBackdropPress}
        accessible={false}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="justify-center items-center"
          >
            <TouchableWithoutFeedback accessible={false}>
              <View
                className={cn(
                  modalContainerVariants({ size }),
                  containerClassName
                )}
                accessible
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
              >
                {/* Header */}
                {showHeader && (
                  <View
                    className={cn(
                      modalHeaderVariants({ variant: headerVariant })
                    )}
                  >
                    {headerContent || (
                      <Text className="text-lg font-semibold flex-1">
                        {title}
                      </Text>
                    )}
                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        className="p-2 -mr-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
                        accessibilityRole="button"
                        accessibilityLabel="Close modal"
                        accessibilityHint="Closes this dialog"
                      >
                        <Text className="text-gray-500 text-xl">✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Content */}
                <View className={cn('p-4', contentClassName)}>{children}</View>

                {/* Footer */}
                {footer && (
                  <View className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {footer}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

/**
 * Confirmation modal with pre-built confirm/cancel buttons
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'footer'> {
  /**
   * Text for confirm button
   * @default 'Confirm'
   */
  confirmText?: string;
  /**
   * Text for cancel button
   * @default 'Cancel'
   */
  cancelText?: string;
  /**
   * Callback when confirm is pressed
   */
  onConfirm: () => void;
  /**
   * Whether confirm action is in progress
   */
  isConfirming?: boolean;
  /**
   * Variant for confirm button
   * @default 'primary'
   */
  confirmVariant?: 'primary' | 'destructive';
}

export function ConfirmModal({
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isConfirming = false,
  confirmVariant = 'primary',
  ...props
}: ConfirmModalProps) {
  return (
    <Modal
      onClose={onClose}
      footer={
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={onClose}
            disabled={isConfirming}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
            accessibilityRole="button"
            accessibilityLabel={cancelText}
          >
            <Text className="text-center font-semibold text-gray-700 dark:text-gray-300">
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            disabled={isConfirming}
            className={cn(
              'flex-1 py-3 rounded-xl',
              confirmVariant === 'destructive' ? 'bg-red-500' : 'bg-primary',
              isConfirming && 'opacity-50'
            )}
            accessibilityRole="button"
            accessibilityLabel={confirmText}
            accessibilityState={{ busy: isConfirming }}
          >
            <Text className="text-center font-semibold text-white">
              {isConfirming ? 'Loading...' : confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      }
      {...props}
    />
  );
}
