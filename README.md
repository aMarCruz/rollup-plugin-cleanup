[![Build Status][build-image]][build-url]
[![AppVeyor Status][wbuild-image]][wbuild-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-cleanup

[Rollup](http://rollupjs.org/) plugin to trim trailing spaces, compact empty lines, and normalize line endings.

With *cleanup*, you have:

* Empty lines compactation (configurable)
* Remotion of trailing spaces
* Normalization of line endings (Unix, Mac, or Windows)
* Source Map support

**Why not Uglify?**

Uglify is a minifier.

## Install

```sh
npm install rollup-plugin-cleanup --save-dev
```

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

By default, only the .js files are processed, but it can be useful for any non-binary file.
You can restrict or expand this using the `rollup` global options "include" and "exclude", or the "extensions" option (see below).

## Options

Name | Default | Description
---- | ------- | -----------
maxEmptyLines | `0` | Use a positive value or -1 to keep all the lines
eolType | `unix` | Allowed values: "unix", "mac", "win"
extensions | `.js` | Array of strings with case-insensitive extensions of files to process.

Source Map support is given through the rollup `sourceMap` option.

## TODO

- [ ] 100% test coverage and more tests
- [ ] async mode
- [ ] Better documentation*
- [ ] You tell me...

---

\* _For me, write in english is 10x harder than coding JS, so contributions are welcome..._

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-cleanup/master.svg?style=flat-square
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-cleanup

[wbuild-image]:   https://img.shields.io/appveyor/ci/aMarCruz/rollup-plugin-cleanup/master.svg?style=flat-square
[wbuild-url]:     https://ci.appveyor.com/project/aMarCruz/rollup-plugin-cleanup/branch/master

[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-cleanup.svg?style=flat-square
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-cleanup

[license-image]:  https://img.shields.io/npm/l/express.svg?style=flat-square
[license-url]:    https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/LICENSE
