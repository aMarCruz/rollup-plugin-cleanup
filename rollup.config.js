/*
  Rollup config.
  With node v6.x the bublé plugin is not necessary.
*/
const external = Object
  .keys(require('./package.json').dependencies)
  .concat('fs', 'path')

const banner = [
  '/**',
  ' * rollup-plugin-cleanup v' + require('./package.json').version,
  ' * @author aMarCruz',
  ' * @license MIT',
  ' */',
].join('\n')

export default {
  input: 'src/index.js',
  plugins: [
  ],
  external,
  output: [
    {
      file: 'dist/rollup-plugin-cleanup.js',
      format: 'cjs',
      banner,
      interop: false,
    },
    {
      file: 'dist/rollup-plugin-cleanup.es.js',
      format: 'es',
      banner,
      interop: false,
    },
  ],
}
