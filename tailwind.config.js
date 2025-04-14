/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 включаем поддержку тем
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
