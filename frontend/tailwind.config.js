/** @type {import('tailwindcss').Config} */

import path from 'path';

export default {
  // Note that those paths are set up this way because in electron build the ./xxx path seem to be relative to the electron folder
  content: [path.resolve(__dirname, 'index.html'), path.resolve(__dirname, 'src') + '/**/*.{js,ts,jsx,tsx}'],
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
      typography: (theme) => ({ 
          DEFAULT: {
            css: {
              color: "#ABABAB",
              h1: {
                fontSize: '56px',
                color: theme('colors.white'),
                fontWeight: 900,
                lineHeight: normal,
                letterSpacing: '-1.12px',
              },
              h2: {
                fontSize: '26px',
                color: theme('colors.white'),
                fontWeight: 900,
                lineHeight: normal,
              },
              h3: {
                fontSize: '22px',
                color: theme('colors.white'),
                fontWeight: 900,
                lineHeight: normal,
              },
              h4: {
                fontSize: '16px',
                color: theme('colors.gray[300]'),
                fontWeight: 600,
                lineHeight: normal,
              },
              p: {
                fontSize:'15px',
                color: theme('colors.gray[300]'),
                fontWeight: 400,
                lineHeight:'24px',
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
      }),
      colors: {
        'primary': '#A67CFF',
        'primary-light': '#B68CFF',
        'primary-dark': '#966CFF',
        'secondary': '#F1FF99',
        'secondary-light': '#FFFFEE',
        'secondary-dark': '#D5FF00', 
        'danger': '#CF4840',
        'success': '#60C164',
        "black": "#000000",
        "white":"#ffffff",
        "yellow":"#F1FF99",
        "purple": {
          200: "#E5D9FF",
          300:"#C6ABFF",
          400:"#A67CFF",
          500:"#7C43F5",
          600:"#5427B4",
          700:"#442586",
        },
        "grayPurple": {
          400: "#8B839E",
          500:"#73678C",
          600:"#594D74",
          700:"#3F3358",
          800:"#2D253E",
          900:"#191324",
        },
        'gray': {
          100:"#E6E6E6",
          200:"#C3C3C3",
          300: '#A6A6A6',
          400: '#737373',
          500: '#3E3E3E',
          600: '#272727',
          700: '#1F1F1F',
          800: '#1A1A1A',
          900: '#111111',
        },
        'green': "#60C164",
        'red': "#CF4840",
        'orange': "#CFA740",
        'blue': "#62ADF2",
      },
    }
  }
}

