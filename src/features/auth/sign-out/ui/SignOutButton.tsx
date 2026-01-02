/**
 * SignOutButton Component
 * FSD Layer: Features
 *
 * Button for signing out the current user
 */

import { Button, type ButtonProps } from '@/shared/ui';
import { useSessionStore } from '@/entities/session';

export interface SignOutButtonProps extends Omit<
  ButtonProps,
  'label' | 'onPress'
> {
  label?: string;
}

export function SignOutButton({
  label = 'Sign Out',
  ...props
}: SignOutButtonProps) {
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <Button label={label} variant="outline" onPress={signOut} {...props} />
  );
}
