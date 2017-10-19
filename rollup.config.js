
import buble from 'rollup-plugin-buble'

const external = Object
  .keys(require('./package.json').dependencies)
  .concat('fs', 'path')

const banner = [
  '/**',
  ' * rollup-plugin-cleanup v' + require('./package.json').version,
  ' * @author aMarCruz',
  ' * @license MIT',
  ' */'
].join('\n')

export default {
  input: 'src/index.js',
  plugins: [
    buble({
      target: { node: 4 }
    })
  ],
  banner,
  external,
  interop: false,
  output: [
    { file: 'dist/rollup-plugin-cleanup.js', format: 'cjs' },
    { file: 'dist/rollup-plugin-cleanup.es.js', format: 'es' }
  ]
}
