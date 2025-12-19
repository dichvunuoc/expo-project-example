/** @type {import('tailwindcss').Config} */
module.exports = {
  // QUAN TRỌNG: Phải trỏ đúng đến cả thư mục app và src
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          foreground: '#FFFFFF',
        },
        background: '#F2F2F7',
        surface: '#FFFFFF',
      },
      fontFamily: {
        // Cấu hình font tùy chỉnh nếu cần
      },
    },
  },
  plugins: [],
};
