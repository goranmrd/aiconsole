/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],

  variants: {
    extend: {
        display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'recent-bg': "url('/bg1.png')",
      },
      boxShadow: {
        'dark': '0px 20px 40px 0px rgba(0, 0, 0, 0.25)'
      },
      typography: {
          DEFAULT: {
            css: {
              color: "#ABABAB",
              'h1, h2, h3, h4, h5, h6, code': {
                color: "#ABABAB",
              },
              a: {
                color: "#1f6feb",
              },
              'pre, code': {
                padding:0,
                background: "transparent",
              }
            },
        },
      },
      colors: {
        'primary': '#A67CFF',
        'primary-light': '#B68CFF',
        'primary-dark': '#966CFF',
        'secondary': '#F1FF99',
        'secondary-light': '#FFFFEE',
        'secondary-dark': '#D5FF00',
        'danger': '#CF4840',
        'success': '#60C164',
        'gray': {
          300: '#A6A6A6',
          400: '#737373',
          500: '#3E3E3E',
          600: '#272727',
          700: '#1F1F1F',
          800: '#1A1A1A',
          900: '#111111',
        },
        'green': {
          400: '#60C164',
          800: '#09390B'
        },
        'red': {
          400: '#CF4840',
          800: '#4E0B07'
        }
      },
    }
  }
}

