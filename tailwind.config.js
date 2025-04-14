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
    extend: {},
  },
  plugins: [],
}
