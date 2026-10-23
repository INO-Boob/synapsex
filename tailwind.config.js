/** @type {import('tailwindcss').Config} */
const mono = ['"Space Mono"', '"IBM Plex Mono"', 'monospace'];
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
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
        // shadcn-токены, подогнанные под чёрно-белую палитру сайта
        background: token('background'),
        foreground: token('foreground'),
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        secondary: { DEFAULT: token('secondary'), foreground: token('secondary-foreground') },
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        accent: { DEFAULT: token('accent'), foreground: token('accent-foreground') },
        destructive: { DEFAULT: token('destructive'), foreground: token('destructive-foreground') },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
      },
    },
  },
  plugins: [],
};
