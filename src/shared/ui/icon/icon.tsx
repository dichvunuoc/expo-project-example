import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { useColorScheme } from 'react-native';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface IconProps extends Omit<
  ComponentProps<typeof Ionicons>,
  'name'
> {
  name: IoniconsName;
}

export function Icon({ name, size = 24, color, style, ...props }: IconProps) {
  const colorScheme = useColorScheme();
  const defaultColor = colorScheme === 'dark' ? '#ffffff' : '#000000';

  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? defaultColor}
      style={style}
      {...props}
    />
  );
}

// Tab Bar Icon component for navigation
export interface TabBarIconProps {
  name: IoniconsName;
  color: string;
  focused?: boolean;
}

export function TabBarIcon({ name, color, focused }: TabBarIconProps) {
  return <Icon name={name} size={focused ? 28 : 24} color={color} />;
}
