/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bce0fd',
          300: '#82cbfa',
          400: '#40b2f6',
          500: '#1899e6',
          600: '#0b7bc5',
          700: '#0a62a0',
          800: '#0c5385',
          900: '#10466e',
          950: '#0a2d4a',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
