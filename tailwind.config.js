/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          dark: '#071525',
        },
        gold: {
          DEFAULT: '#D9A21B',
          light: '#E8C158',
        },
        off: '#F7F6F2',
        charcoal: '#20252B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(217,162,27,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(217,162,27,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
}
