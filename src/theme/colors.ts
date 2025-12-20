export type ThemeMode = 'light' | 'dark';

// Interface for color scheme
export interface Colors {
  // Primary colors
  primary: string;
  primaryForeground: string;

  // Background colors
  background: string;
  card: string;
  modal: string;

  // Surface colors
  surface: string;
  border: string;
  input: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Semantic colors (for specific use cases)
  tabActive: string;
  tabInactive: string;
  buttonPrimary: string;
  buttonSecondary: string;
}

// Light theme colors
export const lightColors: Colors = {
  primary: '#007AFF',
  primaryForeground: '#FFFFFF',

  background: '#FFFFFF',
  card: '#FFFFFF',
  modal: '#FFFFFF',

  surface: '#F8F9FA',
  border: '#E5E7EB',
  input: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  tabActive: '#007AFF',
  tabInactive: '#9CA3AF',
  buttonPrimary: '#007AFF',
  buttonSecondary: '#6B7280',
};

// Dark theme colors
export const darkColors: Colors = {
  primary: '#007AFF',
  primaryForeground: '#FFFFFF',

  background: '#000000',
  card: '#111827',
  modal: '#111827',

  surface: '#1F2937',
  border: '#374151',
  input: '#374151',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  tabActive: '#007AFF',
  tabInactive: '#6B7280',
  buttonPrimary: '#007AFF',
  buttonSecondary: '#4B5563',
};

// Export color sets
export const Colors: Record<ThemeMode, Colors> = {
  light: lightColors,
  dark: darkColors,
};

// Default colors (fallback)
export const defaultColors: Colors = lightColors;

// Color utilities
export const getColorValue = (colors: Colors, colorPath: string): string => {
  const pathParts = colorPath.split('.');
  let value: any = colors;

  for (const part of pathParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
};

// Color aliases for common use
export const ColorUtils = {
  getStatusColor: (
    status: 'success' | 'warning' | 'error' | 'info',
    colors: Colors
  ): string => {
    return colors[status] || colors.text;
  },

  getTextColor: (backgroundColor: string): string => {
    // Simple luminance check to determine appropriate text color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#111827' : '#F9FAFB';
  },

  // Generate opacity variants
  withOpacity: (color: string, opacity: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
};
