[![Build Status][build-image]][build-url]
[![AppVeyor Status][wbuild-image]][wbuild-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-cleanup

[Rollup](http://rollupjs.org/) plugin to remove comments, trim trailing spaces, compact empty lines, and normalize line endings in .js files.

With *cleanup*, you have:

* Remotion of JavaScript through powerful filters (configurable)
* Empty lines compactation (configurable)
* Remotion of trailing spaces
* Normalization of line endings (Unix, Mac, or Windows)
* Source Map support

**Why not Uglify?**

Uglify is a excelent *minifier* but you have little control over the results, while with cleanup your coding style remains intact and removal of comments is strictly under your control.

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

By default, only the .js files are processed, but it can be useful for any non-binary file if you pass the option `comments='all'` to the plugin.
You can restrict the accepted files using the `rollup` global options "include" and "exclude", or the "extensions" option (see below).

## Options

Name | Default | Description
---- | ------- | -----------
comments | `['some']` | Regex, array of filter names, "all" to keep all, or "none" to remove all.
maxEmptyLines | `0` | Use a positive value or -1 to keep all the lines
normalizeEols | `unix` | Allowed values: "unix", "mac", "win"
sourceType | `'module'` | For the parser, change it to "script" if necessary.
extensions | `.js` | Array of strings with case-insensitive extensions of files to process.

### Predefined Filters

Name    | Regex | Site/Description
--------|-------|-----------------
license | `/^@license\b/` | Preserve comments with `"@license"` inside.
some    | `/(?:@license|@preserve|@cc_on)\b/` | Like the [uglify](https://github.com/mishoo/UglifyJS2) default
jsdoc   | `/^\/\*\*[^@]*@[A-Za-z]/` | [JSDoc](http://usejsdoc.org/)
jslint  | `/^\/[*\/](?:jslint|global|property)\b/` | [JSLint](http://www.jslint.com/help.html)
jshint  | `/^\/[*\/]\s*(?:jshint|globals|exported)\s/` | [JSHint](http://jshint.com/docs/#inline-configuration)
eslint  | `/^\/[*\/]\s*(?:eslint(?:\s|-[ed])|global\s)/` | [ESLint](http://eslint.org/docs/user-guide/configuring)
jscs    | `/^\/[*\/]\s*jscs:[ed]/` | [jscs](http://jscs.info/overview)
istanbul | `/^\/[*\/]\s*istanbul\s/` | [istanbul](https://gotwarlost.github.io/istanbul/)
srcmaps | `/\/\/#\ssource(Mapping)URL=/` | [Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) in HTML 5 Rocks!

Source Map support is given through the rollup `sourceMap` option.

## TODO

This is work in progress, so please update cleanup constantly, I hope the first stable version does not take too long.

- [ ] 100% test coverage and more tests
- [ ] async mode
- [ ] Configuration from the file system
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
