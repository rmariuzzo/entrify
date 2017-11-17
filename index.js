'use strict'

/**
 * Module dependencies.
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

/**
 * Module exports.
 * @public
 */

module.exports = entrify

/**
 * Default options.
 * @private
 */

const defaults = {
  format: 'cjs',
}

/**
 * Entrify a path.
 * @param {String} dir The path.
 * @param {Object} options Hash of options.
 */

function entrify(dir, options = {}) {

  if (!dir) {
    throw new Error('the path is required')
  }

  if (typeof dir !== 'string') {
    throw new Error('the path must be a string')
  }

  options = Object.assign({}, defaults, options)

  return entrifyFromPkg(dir, options)

}

/**
 * Entrify a directory by creating an index.js file when a valid package.json is found.
 * @param {String} dir The directory to entrify.
 * @param {Object} options Hash of options.
 */

function entrifyFromPkg(dir, options) {

  // Find package.json files.
  const pkgPaths = glob.sync('**/package.json', { cwd: dir, nodir: true, absolute: true })

  pkgPaths.forEach((pkgPath) => {
    console.log('[entrify]', 'Found:', pkgPath)
    const pkg = require(pkgPath)

    // A package.json file should have a main entry.
    if (!pkg.main) {
      console.warn('[entrify]', pkgPath, 'does not have a main entry.')
      return
    }

    // The main entry should not point to an index.js file.
    if (pkg.main === 'index.js' || pkg.main === './index.js') {
      console.warn('[entrify]', pkgPath, 'main entry is index.js.')
      return
    }

    // Ensure the index.js file to create doesn't already exist.
    const pkgDir = path.dirname(pkgPath)
    const indexPath = `${pkgDir}/index.js`

    if (fs.existsSync(indexPath)) {
      console.warn('[entrify]', indexPath, 'already exists.')
      return
    }

    // Create an index.js file alongside the package.json.
    const name = camelize(path.basename(pkgDir))
    const main = pkg.main.startsWith('./') ? pkg.main : `./${pkg.main}`

    fs.writeFileSync(indexPath, indexTemplate(options.format, { name, main }))
    console.log('[entrify]', indexPath, 'created!')

    // Delete the package.json file.
    fs.unlinkSync(pkgPath)
    console.log('[entrify]', pkgPath, 'deleted!')
  })
}

/**
 * Utility functions.
 * @private
 */

/**
 * Create contents for an index.js file.
 * @param {String} format The format to use. 'cjs' or 'esm'.
 * @param {Object} data The data to use as part of the template.
 */

function indexTemplate(format, data) {
  if (format === 'cjs') {
    return `module.exports = require('${data.main}')`
  }
  if (format === 'esm') {
    return `import ${data.name} from '${data.main}'

export default ${data.name}`
  }
}

/**
 * Convert a string to camelCase.
 * @param {String} str The string to camelize.
 * @return {String} The camelized version of the provided string.
 */

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/[\s\-_]+/g, '')
}
