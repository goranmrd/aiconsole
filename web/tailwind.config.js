/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      fontFamily: {
        display: 'Oswald, ui-serif', // Adds a new `font-display` class
      },
      colors: {
        'primary': '#A67CFF',
        'primary-light': '#B68CFF',
        'primary-dark': '#966CFF',
        'secondary': '#F1FF99',
        'secondary-light': '#FFFFEE',
        'secondary-dark': '#D5FF00',
        'gray': {
          300: '#ABABAB',
          400: '#737373',
          500: '#3E3E3E',
          600: '#272727',
          700: '#1F1F1F',
          800: '#1A1A1A',
          900: '#111111',
        }
      },
    }
  }
}

