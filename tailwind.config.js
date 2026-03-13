const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable toggling dark mode via class on HTML tag
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Premium Platform Palette
        primary: colors.blue,
        secondary: colors.indigo,
        accent: colors.cyan,
        dark: {
          bg: '#0f172a',    // Tailwind Slate 900
          card: '#1e293b',  // Tailwind Slate 800
          border: '#334155',// Tailwind Slate 700
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to right bottom, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9))',
        'hero-dark': 'linear-gradient(to right bottom, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.9))'
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.5)',
        'glow-secondary': '0 0 20px rgba(79, 70, 229, 0.5)',
      }
    },
  },
  plugins: [],
}
