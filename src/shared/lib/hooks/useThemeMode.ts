import { warn as logger } from '@/shared/lib/logger';
import { useThemeContext } from '@/shared/theme/ThemeProvider';
import { type ThemeMode } from '@/shared/theme/colors';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

// Hook to manage theme mode with persistence
export const useThemeMode = () => {
  const { theme, setTheme } = useThemeContext();
  const [isSystemMode, setIsSystemMode] = useState(false);

  // Initialize theme mode from storage or system preference
  useEffect(() => {
    const initTheme = async () => {
      try {
        // Check if user has saved preference
        const storage = createMMKV({ id: 'app-settings' });

        const savedMode = storage.getString('theme-mode') as
          | ThemeMode
          | undefined;

        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
          setIsSystemMode(false);
          setTheme(savedMode);
        } else {
          // Use system preference
          setIsSystemMode(true);
          const systemMode =
            Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
          setTheme(systemMode);
        }
      } catch (error) {
        logger(
          'Failed to initialize theme mode',
          error as Record<string, unknown>,
          {
            component: 'useThemeMode',
            action: 'initializeTheme',
          }
        );
        // Fallback to system
        setIsSystemMode(true);
        const systemMode =
          Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
        setTheme(systemMode);
      }
    };

    initTheme();
  }, [setTheme]);

  // Listen for system appearance changes
  useEffect(() => {
    if (!isSystemMode) return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const newMode = colorScheme === 'dark' ? 'dark' : 'light';
      setTheme(newMode);
    });

    return () => subscription.remove();
  }, [isSystemMode, setTheme]);

  // Set specific theme mode
  const setThemeMode = async (mode: ThemeMode | 'system') => {
    try {
      const storage = createMMKV({ id: 'app-settings' });

      if (mode === 'system') {
        // Remove saved preference and use system
        storage.remove('theme-mode');
        setIsSystemMode(true);
        const systemMode =
          Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
        setTheme(systemMode);
      } else {
        // Save user preference
        storage.set('theme-mode', mode);
        setIsSystemMode(false);
        setTheme(mode);
      }
    } catch (error) {
      logger('Failed to save theme mode', error as Record<string, unknown>, {
        component: 'useThemeMode',
        action: 'setThemeMode',
      });
      // Still apply the theme even if saving fails
      if (mode !== 'system') {
        setIsSystemMode(false);
        setTheme(mode);
      }
    }
  };

  // Reset to system theme
  const resetToSystem = async () => {
    await setThemeMode('system');
  };

  return {
    currentMode: theme.mode,
    isDark: theme.isDark,
    isSystemMode,
    setThemeMode,
    resetToSystem,
    availableModes: ['light', 'dark', 'system'] as const,
  };
};
