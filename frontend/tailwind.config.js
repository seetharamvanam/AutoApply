/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
        primary: {
           DEFAULT: '#8B5CF6', 
           hover: '#7C3AED',
           glow: '#a78bfa',
        },
        secondary: '#06B6D4',
        accent: '#F472B6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

