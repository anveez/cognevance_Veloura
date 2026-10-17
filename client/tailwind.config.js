/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#120c09',
        cocoa: '#241810',
        umber: '#3a281b',
        parchment: '#efe3cc',
        sand: '#b9a98c',
        gold: '#c9a45c',
        ember: '#b5651d',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translateY(0) translateX(0)', opacity: '0.15' },
          '50%': { transform: 'translateY(-26px) translateX(8px)', opacity: '0.7' },
        },
      },
      animation: { drift: 'drift 9s ease-in-out infinite' },
    },
  },
  plugins: [],
};