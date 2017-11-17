<div align=center>

# entrify

📦  Library to convert `package.json` to `index.js`.

</div>

Some project has a `package.json` for each of component directories. This is with the benefit to be able to indicate the a main file per directory, which is nice. However, some tools like prettier and eslint, and features as webpack resolve/alias will not work properly.

To remediate this situation we have to create an `index.js` file for each of those `package.json`. That's where **entrify** shines ✨.

> 💁 **Hey!** For the command line tool head to: [entrify-cli](https://github.com/rmariuzzo/entrify-cli).

## Installation

```shell
npm install entrify --save
```

or 

```shell
yarn add entrify
```

## Usage

```js
const path = require('path')
const entrify = require('entrify')

entrify(path.join(__dirname, './src/components'))
```

**Before:**

```
 src/components/
  | -- button
        | -- package.json   (the main field points to `Button.js`)
        | -- Button.js
```

**After:**

```
 src/components/
  | -- button
        | -- index.js       (created in place of the package.json, it exports `Button.js`)
        | -- Button.js
```

## Documentation

### `entrify(directory)`

  - **`directory`** – `String`. The directory to traverse.
  - **`options`** – `Object`. Hash of options.
    - **`format`** – `String`. Format of the `index.js` to create. Valid options are: `cjs` and `esm`.

## Development

  1. Clone and fork this repo.
  2. Install dependencies: yarn or npm install.
  3. [Run tests](#test).
  4. Prepare a pull request.

### Test

  - `yarn test` – to run all tests.
  - `yarn test -- --watch` – to run all tests in watch mode.

### Publish

  1. Bump package version: `yarn version --new-version x.x.x -m 'Version %s.'`.
  2. Publish to NPM registry: `npm publish`.
  3. Push new tag: `git push origin --tags`.

<div align=center>

Made with :heart: by [Rubens Mariuzzo](https://github.com/rmariuzzo).

[MIT license](LICENSE)

</div>
