/** @type {import('tailwindcss').Config} */
const { lightColors, darkColors } = require('./src/theme/colors');

module.exports = {
  // QUAN TRỌNG: Phải trỏ đúng đến cả thư mục app và src
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class', // Enable dark mode class support
  theme: {
    extend: {
      // Use theme colors in Tailwind
      colors: {
        // Light theme colors
        primary: lightColors.primary,
        'primary-foreground': lightColors.primaryForeground,
        background: lightColors.background,
        card: lightColors.card,
        surface: lightColors.surface,
        border: lightColors.border,
        input: lightColors.input,
        text: lightColors.text,
        'text-secondary': lightColors.textSecondary,
        'text-tertiary': lightColors.textTertiary,
        success: lightColors.success,
        warning: lightColors.warning,
        error: lightColors.error,
        info: lightColors.info,
        'tab-active': lightColors.tabActive,
        'tab-inactive': lightColors.tabInactive,
        'button-primary': lightColors.buttonPrimary,
        'button-secondary': lightColors.buttonSecondary,

        // Dark theme colors (with dark: prefix)
        dark: {
          primary: darkColors.primary,
          'primary-foreground': darkColors.primaryForeground,
          background: darkColors.background,
          card: darkColors.card,
          surface: darkColors.surface,
          border: darkColors.border,
          input: darkColors.input,
          text: darkColors.text,
          'text-secondary': darkColors.textSecondary,
          'text-tertiary': darkColors.textTertiary,
          success: darkColors.success,
          warning: darkColors.warning,
          error: darkColors.error,
          info: darkColors.info,
          'tab-active': darkColors.tabActive,
          'tab-inactive': darkColors.tabInactive,
          'button-primary': darkColors.buttonPrimary,
          'button-secondary': darkColors.buttonSecondary,
        },
      },
      fontFamily: {
        // Cấu hình font tùy chỉnh nếu cần
      },
    },
  },
  plugins: [],
};
