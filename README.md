[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-cleanup

[Rollup](http://rollupjs.org/) plugin to remove comments, trim trailing spaces, compact empty lines, and normalize line endings in JavaScript files.

With *cleanup*, you have:

* Removal of JavaScript comments through powerful filters (configurable)
* Normalization of line endings (Unix, Mac, or Windows)
* Empty lines compactation (configurable)
* Remotion of trailing spaces preserving ES6 Template Literal Strings
* Source Map support

Please see [Whats New](#whats-new), cleanup v3.0.0 requires node v4.2 or above.

**IMPORTANT:**

Because _rollup_ is a JavaScript bundler and _cleanup_ is a JavaScript post-processor, it should work with any JavaScript dialect handled by rollup, but you need put cleanup last in your plugin list.


**Why not Uglify?**

Uglify is a excelent *minifier* but you have little control over the results, while with cleanup your coding style remains intact and removal of comments is strictly under your control.

## Install

```sh
$ npm install rollup-plugin-cleanup --save-dev
# or with yarn
$ yarn add rollup-plugin-cleanup -D
```

## Usage

```js
import { rollup } from 'rollup';
import awesome from 'rollup-plugin-awesome';
import cleanup from 'rollup-plugin-cleanup';

rollup({
  input: 'src/main.js',
  plugins: [
    awesome(),        // other plugins
    cleanup()         // cleanup here
  ]
}).then(...)
```

That's it.

You can restrict the accepted files using the options `include`, `exclude`, and `extensions` (see below).
By default, only the .js, .jsx, and .tag files are processed, but it can be useful for any non-binary file if you skip the JS parsing by setting `comments` to "all" and the `include` option to the desired extensions.

## Options

Name | Default | Description
---- | ------- | -----------
comments | `'some'` | Filter or array of filter names and/or regexes. Use "all" to keep all, or "none" to remove all the comments.
maxEmptyLines | `0` | Use a positive value or `-1` to keep all the lines.
normalizeEols | `unix` | Allowed values: "unix", "mac", "win".
ecmaVersion   | 9   | For the JS parser, JS/ECMAScript version.
sourceType | `'module'` | For the JS parser, change it to "script" if necessary.
acornOptions  | none | Additional settings passed to the [Acorn](https://github.com/acornjs/acorn) parser (new in v3.0).
include    | `''` | [minimatch](https://github.com/isaacs/minimatch) or array of minimatch patterns for paths to include in the process.
exclude    | `''` | minimatch or array of minimatch patterns for paths to exclude of the process.
extensions | `['.js', '.jsx', '.tag']` | String or array of strings with extensions of files to process.

\* Emission of source map honors the Rollup `sourceMap` or `sourcemap` (lowercased) options.

## Predefined Comment Filters

See the regexes in [src/parse-options.js](https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/src/parse-options.js)

Name    | Site/Description
--------|-----------------
license | Preserve comments with the word "@license" inside.
some    | Like the [uglify](https://github.com/mishoo/UglifyJS2) default: "@license", "@preserve", "@cc_on"
jsdoc   | [JSDoc](http://usejsdoc.org/) tags
jslint  | [JSLint](http://www.jslint.com/help.html) directives
jshint  | [JSHint](http://jshint.com/docs/#inline-configuration) directives
eslint  | [ESLint](http://eslint.org/docs/user-guide/configuring) directives
ts3s:   | TypeScript [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)
jscs    | [jscs](http://jscs.info/overview) instructions
istanbul | [istanbul](https://gotwarlost.github.io/istanbul/) comments
srcmaps | [Source Map](http://source-map.github.io/) (inlined or external)

### Custom Filters

You can set custom filters through regexes that matches the content of the comments that you want to preserve
(multiline comments begins with an asterisk (`*`), one-line comments begins with a slash (`/`)).


**Example:**

This filter will preserve multiline comments starting with a dash, in addition to eslint directives:

```js
  ...
  plugins: [
    cleanup({
      comments: ['eslint', /^\*-/]
    })
  ]
```

### Using Acorn Plugins

Cleanup comes preconfigured to be easy to use, but for special needs (i.e. Stage 3 features) you can use [Acorn plugins](https://github.com/acornjs/acorn#plugins) in combination with the new `acornOptions` option.

For example, this fragment of rollup.config.js uses the [acorn-dynamic-import](https://github.com/kesne/acorn-dynamic-import) plugin to support dynamic `import()`:

```js
// rollup.config.js
import acorn from 'acorn'
import inject from 'acorn-dynamic-import/lib/inject'

inject(acorn)  // inject the plugin into global acorn

export default {
  input: 'src/index.js',
  plugins: [
    cleanup({
      acornOptions: {
        plugins: {
          dynamicImport: true
        }
      }
    })
  ],
  // ...etc
```

For info about the use of a plugin, please visit the site of each particular plugin.

### What's New

- New option `acornOptions`, for advanced usage.
  This is an optional, plain JS object with additional settings passed to the [Acorn](https://github.com/acornjs/acorn) parser. Properties of this object are merged with, and take precedence over, the existing `ecmaVersion` and `sourceType` options.
- The mimimum node version is now 6.14, for compatibility with ESLint 5.
- Updated devDependencies.

---

\* _Contributions and stars are welcome..._

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-cleanup/master.svg?style=flat-square
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-cleanup

[wbuild-image]:   https://img.shields.io/appveyor/ci/aMarCruz/rollup-plugin-cleanup/master.svg?style=flat-square
[wbuild-url]:     https://ci.appveyor.com/project/aMarCruz/rollup-plugin-cleanup/branch/master

[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-cleanup.svg?style=flat-square
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-cleanup

[license-image]:  https://img.shields.io/npm/l/express.svg?style=flat-square
[license-url]:    https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/LICENSE

[cover-image]:    https://img.shields.io/codeclimate/coverage/github/aMarCruz/rollup-plugin-cleanup.svg?style=flat-square
[cover-url]:      https://codeclimate.com/github/aMarCruz/rollup-plugin-cleanup/coverage

[issues-image]:		https://img.shields.io/codeclimate/issues/github/aMarCruz/rollup-plugin-cleanup.svg?style=flat-square
[issues-url]:     https://codeclimate.com/github/aMarCruz/rollup-plugin-cleanup
