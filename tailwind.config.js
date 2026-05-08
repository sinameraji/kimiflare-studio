/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          // MUJI brand palette — natural, unbleached, minimal
          bg: '#F7F5F0',
          surface: '#F0EDE6',
          elevated: '#E8E4DB',
          'elevated-hover': '#DDD8CD',
          // MUJI signature red
          primary: '#7F0019',
          'primary-light': '#9B1B30',
          // Natural accent tones
          success: '#5A7D5A',
          'success-light': '#E8F0E8',
          warning: '#B8860B',
          'warning-light': '#F5EFE3',
          critical: '#A0522D',
          'critical-light': '#F5E8E4',
          info: '#6B8E6B',
          'info-light': '#E8F0F0',
          // Text — warm, not cold
          text: '#2D2926',
          'text-secondary': '#6B6560',
          'text-tertiary': '#A8A29A',
          // Functional
          decision: '#C4A77D',
          cost: '#B8A05C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
