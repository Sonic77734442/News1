/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 включаем поддержку тем
<<<<<<< HEAD
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
=======
 content: [
  './pages/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
  './app/**/*.{js,ts,jsx,tsx}',
  './studio/**/*.{js,ts,jsx,tsx,ts}', // если ты используешь интерфейсы внутри studio
],
>>>>>>> 319e0e7 (Initial commit)
  theme: {
    extend: {},
  },
  plugins: [],
};
