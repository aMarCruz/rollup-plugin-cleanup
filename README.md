[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-cleanup

[Rollup](http://rollupjs.org/) plugin to trim trailing spaces, compact empty lines, and normalize line endings.

With *cleanup*, you have:

* Empty lines compactation (optional, configurable)
* Remotion of trailing spaces
* Normalization of line endings (Windows, Unix, or Mac)
* Source Map support

**Why not Uglify?**

Uglify is a minifier.

## Install

```sh
npm install rollup-plugin-cleanup --save-dev
```

*cleanup* works in node.js v4 or above (there's a node v0.12 compatible version in the `dist/legacy` folder).

## Usage

```js
import { rollup } from 'rollup';
import cleanup from 'rollup-plugin-cleanup';

rollup({
  entry: 'src/main.js',
  plugins: [
    cleanup()
  ]
}).then(...)
```

That's it.

By default, only the .js files are processed, but you can restrict or expand this using the `rollup` global options "include" and "exclude", or the "extensions" option (see below).

## Options

Name | Default | Description
---- | ------- | -----------
maxEmptyLines | `0` | Use a positive value or -1 to keep all the lines
eolType | `unix` | Allowed values: "win", "mac", "unix"
extensions | `.js` | Array of strings with case-insensitive extensions of files to process.

Source Map support is given through the rollup `sourceMap` option.

## TODO

- [ ] 100% test coverage and more tests
- [ ] async mode
- [ ] Better documentation*
- [ ] You tell me...

\* _For me, write in english is 10x harder than coding JS, so contributions are welcome..._

---

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-cleanup.svg
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-cleanup
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-cleanup.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-cleanup
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/LICENSE
