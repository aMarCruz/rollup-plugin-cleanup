
var buble = require('rollup-plugin-buble')
var external = Object
    .keys(require('./package.json').dependencies)
    .concat('fs', 'path')

module.exports = {
  entry: 'src/index.js',
  plugins: [buble()],
  external: external
}
