/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#fef2f2', 100:'#fee2e2', 500:'#c0392b', 600:'#a93226', 700:'#922b21', 800:'#7b241c', 900:'#641e16' },
        dark: { 800:'#1a1a2e', 900:'#16213e' }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
