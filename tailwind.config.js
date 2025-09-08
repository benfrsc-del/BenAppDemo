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
        'mecone-greenfield': '#254F38',
        'mecone-urbanzest': '#CAFF01',
        'mecone-forest': '#37C79B',
        'mecone-lawn': '#00D37F',
        'mecone-iris': '#BDB0CF',
        'mecone-purple': '#6481DE',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
