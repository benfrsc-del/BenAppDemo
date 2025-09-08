/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'planning-blue': '#1e40af',
        'planning-green': '#059669',
        'council-orange': '#ea580c',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}