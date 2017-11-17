'use strict'

const fs = require('fs-extra')
const tmp = require('tmp')
const path = require('path')
const entrify = require('..')

describe('entrify', () => {

  let testDir

  beforeEach(() => {
    testDir = tmp.dirSync({ unsafeCleanup: true })
    fs.copySync(path.join(__dirname, './fixtures'), testDir.name)
  })

  afterEach(() => {
    testDir.removeCallback()
  })

  it('should create an index.js for a package.json', () => {
    const dir = `${testDir.name}/valid-package`
    entrify(dir)

    expect(fs.existsSync(`${dir}/index.js`)).toBe(true)
    expect(fs.existsSync(`${dir}/package.json`)).toBe(false)
    expect(require(`${dir}/index.js`)).toBe('test')
  })

  it('should create an index.js for a package.json in different format', () => {
    const dir = `${testDir.name}/valid-package`
    entrify(dir, { format: 'esm' })

    expect(fs.existsSync(`${dir}/index.js`)).toBe(true)
    expect(fs.existsSync(`${dir}/package.json`)).toBe(false)
    expect(fs.readFileSync(`${dir}/index.js`).toString()).toMatch(/import/)
  })

  it('should not create an index.js if the package.json main field points to index.js', () => {
    const dir = `${testDir.name}/invalid-package`
    entrify(dir)

    expect(fs.existsSync(`${dir}/index.js`)).toBe(false)
    expect(fs.existsSync(`${dir}/package.json`)).toBe(true)
  })

  it('should create an index.js for a package.json found in a nested directory', () => {
    const dir = `${testDir.name}/nested-package`
    entrify(dir)

    expect(fs.existsSync(`${dir}/valid-package/index.js`)).toBe(true)
    expect(fs.existsSync(`${dir}/valid-package/package.json`)).toBe(false)
    expect(require(`${dir}/valid-package/index.js`)).toBe('test')
  })

})
