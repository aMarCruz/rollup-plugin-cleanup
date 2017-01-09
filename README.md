[![Build Status][build-image]][build-url]
[![Test Coverage][cover-image]][cover-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-cleanup

[Rollup](http://rollupjs.org/) plugin to remove comments, trim trailing spaces, compact empty lines, and normalize line endings in JavaScript files.

With *cleanup*, you have:

* Removal of JavaScript comments through powerful filters (configurable)
* Normalization of line endings (Unix, Mac, or Windows)
* Empty lines compactation (configurable)
* Remotion of trailing spaces
* Source Map support

**IMPORTANT:**

Because _rollup_ is a JavaScript bundler and _cleanup_ is a JavaScript post-processor, it should work with any JavaScript dialect handled by rollup, but you need put cleanup last in your plugin list.


**Why not Uglify?**

Uglify is a excelent *minifier* but you have little control over the results, while with cleanup your coding style remains intact and removal of comments is strictly under your control.

## Install

```sh
npm install rollup-plugin-cleanup --save-dev
```

## Usage

```js
import { rollup } from 'rollup';
import awesome from 'rollup-plugin-awesome';
import cleanup from 'rollup-plugin-cleanup';

rollup({
  entry: 'src/main.js',
  plugins: [
    awesome(),        // other plugins
    cleanup()         // cleanup here
  ]
}).then(...)
```

That's it.

You can restrict the accepted files using the options "include", "exclude", and "extensions" (see below).
By default, only the .js, .jsx, and .tag files are processed, but it can be useful for any non-binary file if you skip the JS parsing by setting the option `comments: 'all'` in the plugin and `include` option with the desired extensions.

## Options

Name | Default | Description
---- | ------- | -----------
comments | `'some'` | Filter or array of filter names and/or regexes. Use "all" to keep all, or "none" to remove all the comments.
maxEmptyLines | `0` | Use a positive value or `-1` to keep all the lines.
normalizeEols | `unix` | Allowed values: "unix", "mac", "win".
sourceType | `'module'` | For the parser, change it to "script" if necessary.
include    | `''` | [minimatch](https://github.com/isaacs/minimatch) or array of minimatch patterns for paths to include in the process.
exclude    | `''` | minimatch or array of minimatch patterns for paths to exclude in the process.
extensions | `['.js', '.jsx', '.tag']` | String or array of strings with extensions of files to process.

\* Source Map support is given through the rollup `sourceMap` option.

## Predefined Filters

Name    | Regex | Site/Description
--------|-------|-----------------
license | `/@license\b/` | Preserve comments with `"@license"` inside.
some    | `/(?:@license|@preserve|@cc_on)\b/` | Like the [uglify](https://github.com/mishoo/UglifyJS2) default
jsdoc   | `/^\*\*[^@]*@[A-Za-z]/` | [JSDoc](http://usejsdoc.org/)
jslint  | `/^[\/\*](?:jslint|global|property)\b/` | [JSLint](http://www.jslint.com/help.html)
jshint  | `/^[\/\*]\s*(?:jshint|globals|exported)\s/` | [JSHint](http://jshint.com/docs/#inline-configuration)
eslint  | `/^[\/\*]\s*(?:eslint(?:\s|-env|-disable|-enable)|global\s)/` | [ESLint](http://eslint.org/docs/user-guide/configuring)
jscs    | `/^[\/\*]\s*jscs:[ed]/` | [jscs](http://jscs.info/overview)
istanbul | `/^[\/\*]\s*istanbul\s/` | [istanbul](https://gotwarlost.github.io/istanbul/)
srcmaps | `/^.[#@]\ssource(?:Mapping)?URL=/` | [Source Map](http://source-map.github.io/)

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

[cover-image]:    https://img.shields.io/codeclimate/coverage/github/aMarCruz/rollup-plugin-cleanup.svg?style=flat-square
[cover-url]:      https://codeclimate.com/github/aMarCruz/rollup-plugin-cleanup/coverage

[issues-image]:		https://img.shields.io/codeclimate/issues/github/aMarCruz/rollup-plugin-cleanup.svg?style=flat-square
[issues-url]:     https://codeclimate.com/github/aMarCruz/rollup-plugin-cleanup
