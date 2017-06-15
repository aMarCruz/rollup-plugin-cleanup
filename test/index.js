'use strict'

var rollup = require('rollup').rollup
var plugin = require('../')
var expect = require('expect')
var path   = require('path')
var fs     = require('fs')

process.chdir(__dirname)

function concat(name, subdir) {
  var file = path.join(__dirname, subdir || 'expected', name)

  file = file.replace(/\\/g, '/')
  if (!path.extname(file)) file += '.js'
  return file
}

function merge(dest, src) {
  for (var p in src) {
    if (src.hasOwnProperty(p)) dest[p] = src[p]
  }
  return dest
}

function testLines(code, expected, lines) {
  var options = { comments: 'all', functions: false, debuggerStatements: false }
  var result
  if (lines != null) {
    if (typeof lines == 'object') merge(options, lines)
    else options.maxEmptyLines = lines
  }
  result = plugin(options).transform(code, 'test.js')
  expect(result == null ? null : result.code).toBe(expected)
}

function testFile(file, opts, save, fexp) {
  var fname  = concat(file, 'fixtures')
  var expected = fexp === null ? null : fs.readFileSync(concat(fexp || file), 'utf8')
  var code   = fs.readFileSync(fname, 'utf8')

  var result = plugin(opts).transform(code, fname)
  if (save && result) fs.writeFileSync(concat(file + '_out'), result.code, 'utf8')

  if (expected == null) {
    expect(result == null).toBe(true)
  } else {
    expect(typeof result.code == 'string' ? result.code : result).toBe(expected)
  }
}


describe('rollup-plugin-cleanup', function () {

  var emptyLines10 = '\n\n\n\n\n\n\n\n\n\n'
  var emptyLinesTop = emptyLines10 + 'X'
  var emptyLinesBottom = 'X' + emptyLines10
  var emptyLinesMiddle = emptyLines10 + 'X' + emptyLines10 + 'X' + emptyLines10

  it('by default removes all the empty lines and normalize to unix', function () {
    testLines([
      '',
      'abc ',
      'x\t',
      '\r\ny \r',
      '\n\n\r\t',
      'z '
    ].join('\n'), 'abc\nx\ny\nz')
  })

  it('do not touch current indentation of non-empty lines', function () {
    testLines('  \n X\n  X ', ' X\n  X')
  })

  it('has fine support for empty lines with `maxEmptyLines`', function () {
    testLines(emptyLinesTop, 'X')
    testLines(emptyLinesBottom, 'X\n')

    testLines(emptyLinesTop, '\nX', 1)
    testLines(emptyLinesBottom, 'X\n\n', 1)
    testLines(emptyLinesMiddle, '\nX\n\nX\n\n', 1)

    testLines(emptyLinesTop, '\n\n\nX', 3)
    testLines(emptyLinesBottom, 'X\n\n\n\n', 3)
    testLines(emptyLinesMiddle, '\n\n\nX\n\n\n\nX\n\n\n\n', 3)
  })

  it('can keep all the lines by setting `maxEmptyLines` = -1', function () {
    testLines(emptyLinesTop, null, -1)
    testLines(emptyLinesBottom, null, -1)
    testLines(emptyLinesMiddle, null, -1)
  })

  it('can convert to Windows line-endings with `normalizeEols` = "win"', function () {
    var opts = { maxEmptyLines: 1, normalizeEols: 'win' }
    testLines(emptyLinesTop, '\r\nX', opts)
    testLines(emptyLinesBottom, 'X\r\n\r\n', opts)
    testLines(emptyLinesMiddle, '\r\nX\r\n\r\nX\r\n\r\n', opts)
  })

  it('and convertion to Mac line-endings with `normalizeEols` = "mac"', function () {
    var opts = { maxEmptyLines: 1, normalizeEols: 'mac' }
    testLines(emptyLinesTop, '\rX', opts)
    testLines(emptyLinesBottom, 'X\r\r', opts)
    testLines(emptyLinesMiddle, '\rX\r\rX\r\r', opts)
  })

  it('makes normalization to the desired `normalizeEols` line-endings', function () {
    var opts = { maxEmptyLines: -1, normalizeEols: 'mac' }
    testLines('\r\n \n\r \r\r\n \r\r \n', '\r\r\r\r\r\r\r\r', opts)
  })

  it('handles ES7', function () {
    testFile('es7')
  })

  it('skip source map generation with `sourceMap: false`', function () {
    var fname  = concat('defaults', 'fixtures')
    var code   = fs.readFileSync(fname, 'utf8')
    var result = plugin({ sourceMap: false }).transform(code, fname)

    expect(result.map == null).toBe(true)
  })

  it('throws on Acorn errors', function () {
    var fname  = concat('with_error', 'fixtures')
    var code   = fs.readFileSync(fname, 'utf8')

    expect(function () {
      plugin().transform(code, fname)
    }).toThrow()
  })
})


describe('removing comments', function () {

  it('with `comments: ["some", "eslint"]', function () {
    testFile('defaults', {
      comments: ['some', 'eslint']
    })
  })

  it('with `comments: "none"`', function () {
    testFile('defaults', { comments: 'none' }, false, 'comments_none')
  })

  it('with `comments: false`', function () {
    testFile('defaults', { comments: false }, false, 'comments_none')
  })

  it('with `comments: true`', function () {
    testFile('defaults', { comments: true }, false, 'comments_all')
  })

  it('with `comments: /@preserve/`', function () {
    testFile('defaults', { comments: /@preserve/ }, false, 'comments_regex')
  })

  it('with long comments', function () {
    testFile('long_comment')
  })

  it('with no changes due normalization nor emptyLines', function () {
    testFile('comments')
  })

  it('with "ts3s" preserves TypeScript Triple-Slash directives.', function () {
    testFile('ts3s', { comments: 'ts3s' })
  })

  it('throws on unknown filters', function () {
    var fname  = concat('comments', 'fixtures')
    var code   = fs.readFileSync(fname, 'utf8')

    expect(function () {
      plugin({ comments: 'foo' }).transform(code, fname)
    }).toThrow()
  })

})


describe('extension handling', function () {
  it('with `extensions: ["*"] must process all extensions', function () {
    testFile('extensions.foo', {
      extensions: ['*']
    })
  })

  it('with specific `extensions` must process given extensions', function () {
    testFile('extensions.foo', {
      extensions: 'foo'
    })
  })

  it('must skip non listed extensions', function () {
    testFile('comments', { extensions: 'foo' }, false, null)
  })
})


describe('Support for post-procesing', function () {

  it('of .jsx files (issue #1)', function () {
    var jsx = require('rollup-plugin-jsx')

    return rollup({
      entry: 'fixtures/issue_1.jsx',
      plugins: [
        jsx({
          factory: 'React.createElement'
        }),
        plugin({
          extensions: ['.js', '.jsx']
        })
      ],
      external: ['react']
    }).then(function (bundle) {
      var result = bundle.generate({ format: 'cjs' })
      expect(result.code).toMatch(/module.exports/).toNotMatch(/to_be_removed/)
      return result
    })
  })

  it('of riot .tag files', function () {
    var riot = require('rollup-plugin-riot')

    return rollup({
      entry: 'fixtures/todo.tag',
      sourceMap: false,
      plugins: [
        riot(),
        plugin()
      ],
      external: ['riot']
    }).then(function (bundle) {
      var result = bundle.generate({ format: 'cjs' })
      expect(result.code).toMatch(/riot\.tag2\(/)
      return result
    })
  })

})


describe('SourceMap support', function () {

  var buble = require('rollup-plugin-buble')

  it('test bundle generated by rollup w/inlined sourcemap', function () {
    return rollup({
      entry: concat('bundle-src.js', 'maps'),
      sourceMap: true,
      plugins: [
        buble(),
        plugin({
          comments: ['some', 'eslint']
        })
      ]
    }).then(function (bundle) {
      var result = bundle.generate({
        format: 'iife',
        indent: true,
        moduleName: 'myapp',
        sourceMap: 'inline',
        sourceMapFile: 'maps/bundle.js', // generates sorce filename w/o path
        banner: '/*\n plugin version 1.0\n*/',
        footer: '/* follow me on Twitter! @amarcruz */'
      })
      var code = result.code + '\n//# source' + 'MappingURL=' + result.map.toUrl()

      /*
        If you modified the source in maps/bundle-src.js, you
        need to write the bundle and test it in the browser again.
      */
      //console.log('\t--- writing bundle with inlined sourceMap...')
      //fs.writeFileSync(concat('bundle', 'maps'), code, 'utf8')

      var expected = fs.readFileSync(concat('bundle', 'maps'), 'utf8')
      expect(code).toBe(expected, 'Genereted code is incorrect!')
    })
  })
})
