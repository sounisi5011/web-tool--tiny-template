const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');

module.exports = {
  ...yaml.load(fs.readFileSync(path.resolve(__dirname, '.eslintrc.yaml'), 'utf8')),
  settings: {
    'svelte3/typescript': require('typescript'),
  },
};
