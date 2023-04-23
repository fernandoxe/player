/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/**/*.{js,jsx,ts,tsx}',
    'public/index.html',
  ],
  theme: {
    extend: {
      animation: {
        bubble: 'bubble 2.8s linear forwards',
        heart: 'heart 1s linear infinite forwards',
      },
      keyframes: {
        bubble: {
          '0%': {
            transform: 'translateY(0)',
            opacity: 0,
          },
          '30%': {
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(-100%)',
          },
        },
        heart: {
          '0%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.25,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
