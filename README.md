# rollup-plugin-cleanup

[![npm Version][npm-badge]][npm-url]
[![License][license-badge]][license-url]
[![AppVeyor Status][appveyor-badge]][appveyor-url]
[![Travis Status][travis-badge]][travis-url]
[![Maintainability][climate-badge]][climate-url]
[![Coverage][coverage-badge]][coverage-url]

[Rollup](http://rollupjs.org/) plugin to remove comments, trim trailing spaces, compact empty lines, and normalize line endings in JavaScript files.

With the rollup-plugin-cleanup you have:

- Compaction of empty lines within multiline comments and/or out of them.
- Normalization of line endings to Unix, Mac, or Windows.
- Removal of JavaScript comments through powerful, configurable filters.
- Removal of trailing whitespace of each line.
- TypeScript definitions.
- Sourcemap support.

From v3.1, this plugin no longer uses acorn. See more in the [Whats New](#whats-new) section.

**Important:**

rollup-plugin-cleanup is based on [js-cleanup](https://github.com/aMarCruz/js-cleanup) and can handle any JS-like file: TypeScript, Flow, React, ES9, etc, but it is mainly a postprocessor, so it should be runned in a later stage of your toolchain, after any preprocessor or transpiler.

**Why not Uglify?**

Uglify is a excelent _minifier_ but you have little control over the results, while with js-cleanup your coding style remains intact and the removal of comments is strictly under your control.

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

By default, only the .js, .jsx, and .tag files are processed, but you can expand or restrict the set of accepted files using the options `include`, `exclude`, and `extensions` (see below).

## Options

From v3.1.0 `normalizeEols` is deprecated in favor of `lineEndings` and the properties `ecmaVersion`, `sourceType`, and `acornOptions` are ignored. See more in [Whats New](#whats-new) section.

Name            | Default  | Description
--------------- | -------- | -----------
comments        | `'some'` | Filter or array of filters that determinates which comments should be preserved.<br>Use "all" to keep all, or "none" to remove all the comments.
compactComments | `true`   | Should js-cleanup also compact whitespace and blank lines in the preserved multiline comments?<br>Line-ending normalization is always done.
maxEmptyLines   | `0`      | Maximum successive empty lines to preserve in the output.<br>Use a positive value, or `-1` to keep all the lines.
lineEndings     | `unix`   | Type of Line-ending for normalization: "unix", "mac", "win".
sourcemap       | `true`   | Should a sourcemap be generated?
include         | `''`     | [minimatch](https://github.com/isaacs/minimatch) or array of minimatch patterns for paths to include in the process.
exclude         | `''`     | minimatch or array of minimatch patterns for paths to exclude of the process.
extensions      | `['js', 'jsx', 'tag']` | String or array of strings with extensions of files to process.

## Predefined Comment Filters

Instead the special 'all' or 'none' keywords, you can use any combination of custom filters along with any of these predefined ones:

Name     | Will preserve...
-------- | -----------------
some     | Comments containing "@license", "@preserve", or starting with "!".
license  | Comments containing "@license".
eslint   | [ESLint](http://eslint.org/docs/user-guide/configuring) directives.
flow     | Facebook [Flow](https://flow.org/en/docs) directives, [comment types](https://flow.org/en/docs/types/comments/), and [flowlint](https://flow.org/en/docs/linting/flowlint-comments/) comments.
istanbul | [istanbul](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md) ignore comments.
jsdoc    | [JSDoc](http://usejsdoc.org/) comments.
jshint   | [JSHint](http://jshint.com/docs/#inline-configuration) directives.
jslint   | [JSLint](http://www.jslint.com/help.html) directives.
sources  | Sourcemap directives [sourceURL](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl) and [sourceMappingURL](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.9ppdoan5f016).
ts       | MS [TypeScript](http://www.typescriptlang.org/) Triple-Slash and @ts-* directives, plus the @jsx pragma.
ts3s     | TypeScript [Triple-Slash](http://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) directives.

From v3.1.0, `some` does not includes '@cc_on' and the `jscs` filter was deprecated. See more in [Whats New](#whats-new) section.

'srcmaps' will be preserved as an alias to the 'sources' filter.

See the regexes in the js-cleanup [src/predef-filters.ts](https://github.com/aMarCruz/js-cleanup/blob/master/src/predef-filters.ts) file.

### Custom Filters

You can set custom filters through regexes that matches the content of the comments that you want to preserve.

The string to which the regex is applied does not includes the first slash, nor the `*/` terminator of the multiline comments, so the multiline comments begins with an asterisk (`*`) and single-line comments begins with a slash (`/`).

For example, the following filters will preserve ESLint directives and multiline comments starting with a dash:

```js
const cleanedCode = jsCleanup(code, null, { comments: ['eslint', /^\*-/] })
```

## What's New

Changes in v3.1.1

- Fixed #15: Version 3.1.0 fails for certain template literals. Thanks to @stotter for repoting this issue.

Changes in v3.1.0

Bye, acorn.

Although [acorn](https://github.com/acornjs/acorn) is an excellent parser, its use in rollup-plugin-cleanup had caused several issues.

v3.1 removes this dependency and now is completely based on [js-cleanup](https://github.com/aMarCruz/js-cleanup), which does not depend on acorn or another similar parser, with the advantage of a relative independency of the version and "dialect" of JavaScript and a little more efficiency, for being a specialized tool.

While js-cleanup is in its first version, I do not expect it to present major problems (the algorithm and the JS rules used for the replacement are fairly simple).

- Added the `compactComment` option to control the compaction of multiline comments, useful to preserve the format of JSDoc blocks.
- The options `ecmaVersion`, `sourceType`, and `acornOptions` are ignored, acorn was removed in this version.
- The `normalizeEols` option is deprecated in favor of `lineEndings`, which have the same behavior.
- The `some` filter no longer includes `@cc_on`, but adds comments that begin with `'!'`.
- The `jscs` filter is deprecated, jscs no longer exists.
- Added the `flow` filter for Facebook Flow comments and directives.
- Added the `ts` filter for MS TypeScript directives.

From v3.0, the minimum supported node version is now 6.14, the oldest maintained LTS version, which includes security fixes and is also supported by ESLint 5.

None of this changes should break your apps, the deprecated features will be handled silently in this version, output a warning in next minor version, and removed in the next major release.

The [conditional compilation](https://docs.microsoft.com/es-es/previous-versions/windows/internet-explorer/ie-developer/scripting-articles/121hztk3(v=vs.84)), used by JScript in oldest non-standard IE mode, can be supported by `/^\*@/`, but if you really need conditional code, take a look to [this plugin](https://github.com/aMarCruz/rollup-plugin-jscc).

## TODO

- [ ] Refactoring Tests

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

## License

The [MIT License](LICENCE) (MIT)

[npm-badge]:      https://badgen.net/npm/v/rollup-plugin-cleanup
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-cleanup
[license-badge]:  https://badgen.net/github/license/aMarCruz/rollup-plugin-cleanup/blue
[license-url]:    https://github.com/aMarCruz/rollup-plugin-cleanup/blob/master/LICENSE
[appveyor-badge]: https://ci.appveyor.com/api/projects/status/vuy62d6cbo1uo0be?svg=true
[appveyor-url]:   https://ci.appveyor.com/project/aMarCruz/rollup-plugin-cleanup
[travis-badge]:   https://travis-ci.org/aMarCruz/rollup-plugin-cleanup.svg?branch=master
[travis-url]:     https://travis-ci.org/aMarCruz/rollup-plugin-cleanup
[climate-badge]:  https://api.codeclimate.com/v1/badges/a63cdadb2dce668d3e8b/maintainability
[climate-url]:    https://codeclimate.com/github/aMarCruz/rollup-plugin-cleanup/maintainability
[coverage-badge]: https://codecov.io/gh/aMarCruz/rollup-plugin-cleanup/branch/master/graph/badge.svg
[coverage-url]:   https://codecov.io/gh/aMarCruz/rollup-plugin-cleanup
[kofi-url]:       https://ko-fi.com/C0C7LF7I
