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
          bg: '#0B0F19',
          surface: '#151B2B',
          elevated: '#1E2538',
          primary: '#4F46E5',
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#06B6D4',
          text: '#F1F5F9',
          'text-secondary': '#94A3B8',
          'text-tertiary': '#64748B',
          decision: '#FBBF24',
          cost: '#A78BFA',
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
