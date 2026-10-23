/** @type {import('tailwindcss').Config} */
const mono = ['"Space Mono"', '"IBM Plex Mono"', 'monospace'];

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: mono,
        serif: mono,
        mono,
        display: ['"Anton SC"', '"Oswald"', 'sans-serif'],
      },
      colors: {
        lilac: '#8E7F94',
        pulse: '#D9CCE3',
      },
    },
  },
  plugins: [],
};
