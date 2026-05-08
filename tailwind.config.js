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
          bg: '#FAF8F5',
          surface: '#F5F2ED',
          elevated: '#EFEBE4',
          'elevated-hover': '#E8E3DA',
          primary: '#8B7355',
          'primary-light': '#A68B6A',
          success: '#7A9A7A',
          'success-light': '#E8F0E8',
          warning: '#C9A96E',
          'warning-light': '#F5EFE3',
          critical: '#B87060',
          'critical-light': '#F5E8E4',
          info: '#6A8FA6',
          'info-light': '#E8F0F5',
          text: '#2D2926',
          'text-secondary': '#6B6560',
          'text-tertiary': '#A8A29A',
          decision: '#C9A96E',
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
