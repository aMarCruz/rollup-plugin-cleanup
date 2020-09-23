/*
  Rollup config.
  With node v6.x the bublé plugin is not necessary.
*/
import pkg from './package.json'

const external = require('module').builtinModules.concat(
  Object.keys(pkg.dependencies),
  Object.keys(pkg.devDependencies)
)

const banner = `/**
 * rollup-plugin-cleanup v${pkg.version}
 * @author aMarCruz
 * @license MIT
 */
/*eslint-disable*/`

export default {
  input: 'src/index.js',
  plugins: [],
  external,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      banner,
      interop: false,
      sourcemap: true,
      preferConst: true,
      exports: 'auto',
    },
    {
      file: pkg.module,
      format: 'es',
      banner,
      interop: false,
      sourcemap: true,
      preferConst: true,
      exports: 'default',
    },
  ],
}
