module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      },
      colors: {
        primary: '#059669', // Emerald 600 - More modern and balanced
        accent: '#10b981',  // Emerald 500
        surface: '#F8FAFC', // Lighter surface
        danger: '#EF4444',
        text: '#0F172A',
      },

    },
  },
  plugins: [],
}
