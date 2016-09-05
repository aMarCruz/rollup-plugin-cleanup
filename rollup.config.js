
let buble = require('rollup-plugin-buble')
let external = Object
    .keys(require('./package.json').dependencies)
    .concat('fs', 'path')
let result

// eslint-disable-next-line eqeqeq
if (process.env.LEGACY == 1) {
  result = {
    entry: 'src/main.js',
    plugins: [buble()],
    external: external
  }
} else {
  result = {
    entry: 'src/main.js',
    plugins: [],
    external: external
  }
}

module.exports = result
