/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This covers your future ui.jsx and index.jsx
    "./public/index.html"        // And your main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}