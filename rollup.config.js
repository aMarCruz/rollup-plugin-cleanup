/*
  Rollup config.
  With node v6.x the bublé plugin is not necessary.
*/
const pkg = require('./package.json')
const banner = `/**
 * rollup-plugin-cleanup v${pkg.version}
 * @author aMarCruz
 * @license MIT
 */
/*eslint-disable*/`

export default {
  input: 'src/index.js',
  plugins: [],
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      banner,
      interop: false,
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      banner,
      interop: false,
      sourcemap: true,
    },
  ],
}
