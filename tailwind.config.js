/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'dark-50': '#0a0a0a',
        'dark-100': '#111111',
        'dark-200': '#1a1a1a',
        'dark-300': '#222222',
        'dark-400': '#2a2a2a',
        'dark-border': '#222222',
        'muted': '#888888',
        'muted-dark': '#666666',
        accent: '#0066FF',
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
        'gradient-brand-light': 'linear-gradient(135deg, #f472b6 0%, #a78bfa 50%, #60a5fa 100%)',
      },
    },
  },
  plugins: [],
}
