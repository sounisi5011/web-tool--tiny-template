// @ts-check
const path = require('path');

/**
 * @param {string} fullPath
 * @param {string} searchPath
 * @returns {boolean}
 */
function startsWith(fullPath, searchPath) {
  return fullPath.startsWith((path.resolve(searchPath).replace(new RegExp(`\\${path.sep}+$`), '')) + path.sep);
}

/**
 * @param {string} basename
 * @returns {function(string): boolean}
 */
function baseFilter(basename) {
  return filename => path.basename(filename) === basename;
}

/**
 * @param  {...string} extList
 * @returns {function(string): boolean}
 */
function extFilter(...extList) {
  extList = extList.map(ext => ext.replace(/^\.?/, '.'));
  return filename => extList.includes(path.extname(filename));
}

module.exports = {
  /**
   * @param {string[]} filenames
   */
  '*': filenames => {
    /** @type {string[]} */
    const commands = [];

    const prettierTargetFiles = filenames.filter(extFilter('json', 'yaml', 'yml', 'svelte'));
    if (prettierTargetFiles.length >= 1) {
      commands.push(
        `prettier --write ${prettierTargetFiles.join(' ')}`,
      );
    }

    const pkgFiles = filenames.filter(baseFilter('package.json'));
    if (pkgFiles.length >= 1) {
      commands.push(
        `prettier-package-json --write ${pkgFiles.join(' ')}`,
        `sort-package-json ${pkgFiles.join(' ')}`,
      );
    }

    const eslintTargetFiles = filenames.filter(extFilter('ts', 'js', 'svelte'));
    if (eslintTargetFiles.length >= 1) {
      commands.push(
        `eslint --fix ${eslintTargetFiles.join(' ')}`,
      );
    }

    /*
     * ESLintは整形してくれないため、ESLintの処理後にもう一度整形を試みる
     */
    const svelteFiles = filenames.filter(extFilter('svelte'));
    if (svelteFiles.length >= 1) {
      commands.push(
        `prettier --write ${svelteFiles.join(' ')}`,
      );
    }

    if (filenames.some(filename => startsWith(filename, 'src') || startsWith(filename, 'docs'))) {
      commands.push(
        'run-s build',
        'git add ./docs/',
      );
    }

    return commands;
  },
};
