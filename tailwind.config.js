/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './studio/src/**/*.{js,ts,jsx,tsx}', // <– добавлен безопасный путь
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#f5f6f8',
          100: '#eef0f3',
          200: '#e4e7ec',
          300: '#d4d9e0',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#0f1219',
          900: '#050608',
          950: '#020304',
        },
      },
    },
  },
  plugins: [],
}
