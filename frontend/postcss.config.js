const path = require('path');

module.exports = {
  plugins: {
    tailwindcss: {
      // Note that this path are set up this way because in electron build the ./xxx path seem to be relative to the electron folder
      config: path.resolve(__dirname, 'tailwind.config.js'), 
    },
    autoprefixer: {},
  },
};
