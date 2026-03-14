// Cấu hình TailwindCSS
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // Font chính cho UI
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        // Bảng màu chủ đạo
        brand: {
          50: '#f0fbff',
          100: '#d9f3ff',
          200: '#b3e7ff',
          300: '#80d7ff',
          400: '#4ac2ff',
          500: '#1aa7f0',
          600: '#1286c5',
          700: '#0f6b9d',
          800: '#0e577f',
          900: '#0f4968'
        },
        accent: {
          500: '#f59e0b'
        }
      }
    }
  },
  plugins: [forms, typography]
};