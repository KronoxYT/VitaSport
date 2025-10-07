/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f3ff',
          100: '#cce7ff',
          200: '#99ceff',
          300: '#66b5ff',
          400: '#339cff',
          500: '#007BFF', // Color principal
          600: '#0062cc',
          700: '#004a99',
          800: '#003166',
          900: '#001933',
        },
        background: {
          light: '#FFFFFF',
          DEFAULT: '#F4F6F8',
          dark: '#E8EDF1',
        },
        content: {
          primary: '#1A202C',
          secondary: '#4A5568',
          light: '#718096',
        },
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'card': '0.75rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}