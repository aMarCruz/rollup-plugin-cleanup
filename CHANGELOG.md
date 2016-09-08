### v0.1.2
- Implements support for the removal of comments through configurable filters, using the [acorn](https://github.com/ternjs/acorn) parser for secure detection.
- Fix the `lint` script of npm.

### v0.1.1
- The generated files includes CommonJS & ES6 module versions, already transpiled.
- Fixes an error when the last empty line does not ends with eol.
- Fixes errors in the build of previous versions (incomplete `dist` folder).
- Fix Travis config, now using ESLint in the test for node 4+
- Adds automatized test for Windows, with the [AppVeyor](https://ci.appveyor.com/) service.
