/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a', // Dark background
        surface: '#1a1a1a', // Slightly lighter for cards
        primary: '#00f0ff', // Neon Cyan
        secondary: '#007bff', // Blue
        accent: '#ff0055', // Red/Pink accent if needed
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
