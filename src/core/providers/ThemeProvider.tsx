/**
 * Theme Provider
 * FSD Layer: App
 *
 * Provides theme context to the application
 * Note: NativeWind v4 works automatically with className, no TwProvider needed
 */

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      {children}
    </NavigationThemeProvider>
  );
}
