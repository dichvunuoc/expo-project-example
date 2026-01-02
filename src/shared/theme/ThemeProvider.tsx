import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { TwProvider } from 'nativewind';
import { Theme, ThemeMode, getTheme, Colors } from './index';

// Theme context
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}>({
  theme: getTheme('light'),
  setTheme: () => {},
  toggleTheme: () => {},
});

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  onThemeChange?: (theme: Theme) => void;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  onThemeChange,
}) => {
  const systemColorScheme = useColorScheme();
  const [currentMode, setCurrentMode] = React.useState<ThemeMode>(
    initialTheme || (systemColorScheme === 'dark' ? 'dark' : 'light')
  );

  // Create theme object
  const theme: Theme = React.useMemo(
    () => getTheme(currentMode),
    [currentMode]
  );

  // Set theme mode
  const setTheme = React.useCallback((mode: ThemeMode) => {
    setCurrentMode(mode);
  }, []);

  // Toggle theme
  const toggleTheme = React.useCallback(() => {
    setCurrentMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Notify parent of theme changes
  useEffect(() => {
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Auto-update theme when system theme changes (if no initial theme)
  useEffect(() => {
    if (!initialTheme && systemColorScheme) {
      setCurrentMode(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, initialTheme]);

  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <TwProvider value={Colors[currentMode]}>{children}</TwProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
};

// Export theme colors for direct access
export const useThemeColors = () => {
  const { theme } = useThemeContext();
  return theme.colors;
};

export default ThemeProvider;
