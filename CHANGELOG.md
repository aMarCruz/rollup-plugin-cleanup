### v0.1.4
- Default `extensions` are changed from `"*"` to `['.js', '.jsx', '.tag']` to avoid conflicts with others plugins.
- The `extensions` option is case-sensitive by consistency with rollup plugins.

### v0.1.3
- The string passed to the comment filters now includes a character preceding the content, `"/"` for one-line comments, and `"*"` for multiline comments.
- Adds note to the README about usage as post-processor - See issue [#1](https://github.com/aMarCruz/rollup-plugin-cleanup/issues/1)
- Now, the default for `extensions` is `"*"`. Because _rollup_ is a JavaScript bundler and _cleanup_ is a JavaScript post-processor, it should to work with any file handled by _rollup_.

### v0.1.2
- Implements support for the removal of comments through configurable filters, using the [acorn](https://github.com/ternjs/acorn) parser for secure detection.
- Fix the `lint` script of npm.

### v0.1.1
- The generated files includes CommonJS & ES6 module versions, already transpiled.
- Fixes an error when the last empty line does not ends with eol.
- Fixes errors in the build of previous versions (incomplete `dist` folder).
- Fix Travis config, now using ESLint in the test for node 4+
- Adds automatized test for Windows, with the [AppVeyor](https://ci.appveyor.com/) service.
