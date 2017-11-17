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

function entrifyFromPkg(dir, options) {
  const matches = glob.sync('**/package.json', { cwd: dir, nodir: true, absolute: true })

  matches.forEach((pkgPath) => {
    console.log('[entrify]', pkgPath)
    const pkg = require(pkgPath)

    if (!pkg.main) {
      console.warn('[entrify]', pkgPath, 'does not have a main entry.')
      return
    }

    if (pkg.main === 'index.js' || pkg.main === './index.js') {
      console.warn('[entrify]', pkgPath, 'main entry is index.js.')
      return
    }

    const pkgDir = path.dirname(pkgPath)
    const indexPath = `${pkgDir}/index.js`

    if (fs.existsSync(indexPath)) {
      console.warn('[entrify]', indexPath, 'already exists.')
      return
    }

    const name = camelize(path.basename(pkgDir))
    const main = pkg.main.startsWith('./') ? pkg.main : `./${pkg.main}`

    fs.writeFileSync(indexPath, indexTemplate(options.format, { name, main }))
    console.log('[entrify]', indexPath, 'created!')

    fs.unlinkSync(pkgPath)
    console.log('[entrify]', pkgPath, 'deleted!')
  })
}

function indexTemplate(format, data) {
  if (format === 'cjs') {
    return `module.exports = require('${data.main}')`
  }
  if (format === 'esm') {
    return `import ${data.name} from '${data.main}'

export default ${data.name}`
  }
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase()
  }).replace(/[\s\-_]+/g, '')
}
