export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#181A1C',
        card: '#3A3D40',
        accent: '#A8E05F',
        honey: '#F4C430'
      },
      borderRadius: {
        '2xl': '24px',
      }
    },
  },
  plugins: [],
}
