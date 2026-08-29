/**  @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          800: '#1e3a8a',
          900: '#1e40af'
        }
      }
    },
  },
  plugins: [],
}
 