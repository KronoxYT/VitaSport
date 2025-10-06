/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#007BFF',
        background: '#F4F6F8',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}