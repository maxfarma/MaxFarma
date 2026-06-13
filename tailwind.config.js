/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:    '#C8102E',
          dark:   '#9B0D22',
          darker: '#7A0019',
          light:  '#FFF0F3',
          muted:  '#F9F0F1',
        },
        gray: {
          950: '#0d0d0d',
        },
      },
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'sm':  '0 1px 3px rgba(0,0,0,.07)',
        'md':  '0 4px 12px rgba(0,0,0,.08)',
        'lg':  '0 8px 24px rgba(0,0,0,.10)',
        'xl':  '0 16px 48px rgba(0,0,0,.12)',
        '2xl': '0 24px 64px rgba(0,0,0,.14)',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      animation: {
        'fade-up': 'fade-up .5s ease both',
        'marquee': 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
