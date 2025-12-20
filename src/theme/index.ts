import { useColorScheme } from 'react-native';
import { Colors, ThemeMode } from './colors';

// Theme context type
export interface Theme {
  colors: Colors;
  mode: ThemeMode;
  isDark: boolean;
}

// Hook for accessing theme
export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? Colors.dark : Colors.light,
    mode: isDark ? 'dark' : 'light',
    isDark,
  };
};

// Export theme utilities
export const getTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark';
  return {
    colors: isDark ? Colors.dark : Colors.light,
    mode,
    isDark,
  };
};

export default {
  useTheme,
  getTheme,
};
