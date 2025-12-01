/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00695C',
          dark: '#004D40',
          light: '#1976D2',
        },
        accent: {
          DEFAULT: '#FF9800',
          amber: '#FFC107',
        },
      },
    },
  },
  plugins: [],
}

