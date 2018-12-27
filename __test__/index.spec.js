'use strict'

const rollup  = require('rollup').rollup
const cleanup = require('../')
const path    = require('path')
const fs      = require('fs')

process.chdir(__dirname)

function concat(name, subdir) {
  let file = path.join(__dirname, subdir || 'expected', name)

  file = file.replace(/\\/g, '/')
  if (!path.extname(file)) {
    file += '.js'
  }

  return file
}

function testLines(code, expected, lines) {
  const options = { comments: 'all', functions: false, debuggerStatements: false }

  if (lines != null) {
    if (typeof lines == 'object') {
      Object.assign(options, lines)
    } else {
      options.maxEmptyLines = lines
    }
  }

  const promise = cleanup(options).transform(code, 'test.js')
  expect(promise).not.toBeNull()

  return promise.then(result => {
    expect(result == null ? null : result.code).toBe(expected)
  })
}

function testFile(file, opts, fexp, save) { // eslint-disable-line max-params
  const fname     = concat(file, 'fixtures')
  const expected  = fexp === null ? null : fs.readFileSync(concat(fexp || file), 'utf8')
  const code      = fs.readFileSync(fname, 'utf8')
  const promise   = cleanup(opts).transform(code, fname)

  if (fexp === null) {
    return expect(promise).toBeNull()
  }

  expect(promise).toBeTruthy()
  return promise.then(result => {
    if (save && result) {
      fs.writeFileSync(concat(file + '_out'), result.code, 'utf8')
    }
    expect(typeof result.code == 'string' ? result.code : result).toBe(expected)
  })
}

// ===========================================================================

describe('rollup-plugin-cleanup', function () {

  const emptyLines10 = '\n\n\n\n\n\n\n\n\n\n'
  const emptyLinesTop = emptyLines10 + 'X'
  const emptyLinesBottom = 'X' + emptyLines10
  const emptyLinesMiddle = emptyLines10 + 'X' + emptyLines10 + 'X' + emptyLines10
  const emptyLinesTemplate = emptyLines10 + '`' + emptyLines10 + '`' + emptyLines10

  test('by default removes all the empty lines and normalize to unix', function () {
    return testLines([
      '',
      'abc ',
      'x\t',
      '\r\ny \r',
      '\n\n\r\t',
      'z ',
    ].join('\n'), 'abc\nx\ny\nz')
  })

  test('do not touch current indentation of non-empty lines', function () {
    return testLines('  \n X\n  X ', ' X\n  X')
  })

  test('has fine support for empty lines with `maxEmptyLines`', function () {
    const promises = [
      testLines(emptyLinesTop, 'X'),
      testLines(emptyLinesBottom, 'X\n'),
      testLines(emptyLinesTemplate, '`' + emptyLines10 + '`\n'),

      testLines(emptyLinesTop, '\nX', 1),
      testLines(emptyLinesBottom, 'X\n\n', 1),
      testLines(emptyLinesMiddle, '\nX\n\nX\n\n', 1),
      testLines(emptyLinesTemplate, '\n`' + emptyLines10 + '`\n\n', 1),

      testLines(emptyLinesTop, '\n\n\nX', 3),
      testLines(emptyLinesBottom, 'X\n\n\n\n', 3),
      testLines(emptyLinesMiddle, '\n\n\nX\n\n\n\nX\n\n\n\n', 3),
      testLines(emptyLinesTemplate, '\n\n\n`' + emptyLines10 + '`\n\n\n\n', 3),
    ]
    return Promise.all(promises)
  })

  test('can keep all the lines by setting `maxEmptyLines` = -1', function () {
    return Promise.all([
      testLines(emptyLinesTop, emptyLinesTop, -1),
      testLines(emptyLinesBottom, emptyLinesBottom, -1),
      testLines(emptyLinesMiddle, emptyLinesMiddle, -1),
      testLines(emptyLinesTemplate, emptyLinesTemplate, -1),
    ])
  })

  test('can convert to Windows line-endings with `normalizeEols` = "win"', function () {
    const opts = { maxEmptyLines: 1, normalizeEols: 'win' }
    return Promise.all([
      testLines(emptyLinesTop, '\r\nX', opts),
      testLines(emptyLinesBottom, 'X\r\n\r\n', opts),
      testLines(emptyLinesMiddle, '\r\nX\r\n\r\nX\r\n\r\n', opts),
      testLines(emptyLinesTemplate, '\r\n`' + emptyLines10 + '`\r\n\r\n', opts),
    ])
  })

  test('and convertion to Mac line-endings with `normalizeEols` = "mac"', function () {
    const opts = { maxEmptyLines: 1, normalizeEols: 'mac' }
    return Promise.all([
      testLines(emptyLinesTop, '\rX', opts),
      testLines(emptyLinesBottom, 'X\r\r', opts),
      testLines(emptyLinesMiddle, '\rX\r\rX\r\r', opts),
      testLines(emptyLinesTemplate, '\r`' + emptyLines10 + '`\r\r', opts),
    ])
  })

  test('makes normalization to the desired `normalizeEols` line-endings', function () {
    const opts = { maxEmptyLines: -1, normalizeEols: 'mac' }
    return testLines('\r\n \n\r \r\r\n \r\r \n', '\r\r\r\r\r\r\r\r', opts)
  })

  test('handles ES7', function () {
    return testFile('es7')
  })

  test('throws with the rollup `this.error` method.', function () {
    const opts = {
      input: 'fixtures/with_error.js',
      plugins: [cleanup()],
    }

    expect.assertions(2)
    return rollup(opts).catch(err => {
      expect(err.code).toBe('PLUGIN_ERROR')
      expect(err).toHaveProperty('loc')
    })
  })

})


describe('Removing comments', function () {

  test('with `comments: ["some", "eslint"]', function () {
    return testFile('defaults', {
      comments: ['some', 'eslint'],
    })
  })

  test('with `comments: "none"`', function () {
    return testFile('defaults', { comments: 'none' }, 'comments_none')
  })

  test('with `comments: false`', function () {
    return testFile('defaults', { comments: false }, 'comments_none')
  })

  test('with `comments: true`', function () {
    return testFile('defaults', { comments: true }, 'comments_all')
  })

  test('with `comments: /@preserve/`', function () {
    return testFile('defaults', { comments: /@preserve/ }, 'comments_regex')
  })

  test('with long comments', function () {
    return testFile('long_comment')
  })

  test('with no changes due normalization nor emptyLines', function () {
    return testFile('comments')
  })

  test('with "ts3s" preserves TypeScript Triple-Slash directives.', function () {
    return testFile('ts3s', { comments: 'ts3s' })
  })

  test('"srcmaps" is an alias to "sources"', function () {
    const opts = { comments: 'srcmaps' }
    const source = '//\n0\n//# sourceURL=a.map\n//# sourceMappingURL=a.js.map'
    return testLines(source, source.substr(3), opts)
  })

  test('throws on unknown filters', function () {
    return expect(() => { cleanup({ comments: 'foo' }) }).toThrow('unknown')
  })

})


describe('Extension handling', function () {

  test('with `extensions: ["*"] must process all extensions', function () {
    return testFile('extensions.foo', {
      extensions: ['*'],
    })
  })

  test('with specific `extensions` must process given extensions', function () {
    return testFile('extensions.foo', {
      extensions: 'foo',
    })
  })

  test('must skip non listed extensions', function () {
    return testFile('comments', { extensions: 'foo' }, null)
  })

  test('must handle empty extensions', function () {
    const opts = { extensions: '.', sourcemap: false }
    const source = 'A'
    expect(cleanup(opts).transform(source, 'a.ext')).toBe(null)

    const promise = cleanup(opts).transform(source, 'no-ext')
    expect(promise).toBeTruthy()
    return promise.then(result => {
      expect(result.code).toBe(source)
    })
  })

})


describe('Issues', function () {

  test('must handle .jsx files (issue #1)', function () {
    const jsx  = require('rollup-plugin-jsx')
    const opts = {
      input: 'fixtures/issue_1.jsx',
      plugins: [
        jsx({
          factory: 'React.createElement',
        }),
        cleanup(),
      ],
      external: ['react'],
    }

    return rollup(opts).then(bundle =>
      bundle.generate({ format: 'cjs' }).then(result => {
        expect(result.code).toMatch(/module.exports/)
        expect(result.code).not.toMatch(/to_be_removed/)
        expect(result.map).toBeFalsy()
      })
    )
  })

  test('must support spread operator by default (issue #10)', function () {
    return testFile('issue_10')
  })

  test('must support import() by default (issue #11)', function () {
    return testFile('issue_11')
  })

})


describe('SourceMap support', function () {

  const validator = require('sourcemap-validator')
  const buble = require('rollup-plugin-buble')

  test('bundle generated by rollup w/inlined sourcemap', function () {

    return rollup({
      input: 'maps/bundle-src.js',
      plugins: [
        buble(),
        cleanup({
          comments: ['some', 'eslint'],
        }),
      ],
    }).then(function (bundle) {

      return bundle.generate({
        format: 'iife',
        indent: true,
        name: 'myapp',
        sourcemap: true,
        sourcemapFile: 'maps/bundle.js', // generates source filename w/o path
        banner: '/*\n plugin version 1.0\n*/',
        footer: '/* follow me on Twitter! @amarcruz */',
      }).then(result => {
        const code = result.code
        const expected = fs.readFileSync(concat('bundle.js', 'maps'), 'utf8')

        expect(code + '\n//# sourceMappingURL=bundle.js.map').toBe(expected, 'Genereted code is incorrect!')
        expect(result.map).toBeTruthy()
        validator(code, JSON.stringify(result.map))
      })

    })
  })

  test('must skip sourcemap generation with `sourceMap: false`', function () {
    const fname   = concat('defaults', 'fixtures')
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourceMap: false }).transform(code, fname)
    expect(promise).toBeTruthy()

    return promise.then(result => {
      expect(result.map).toBeFalsy()
    })
  })

  test('must skip sourcemap generation with `sourcemap: false` (lowercase)', function () {
    const fname   = concat('defaults', 'fixtures')
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourcemap: false }).transform(code, fname)
    expect(promise).toBeTruthy()

    return promise.then(result => {
      expect(result.map).toBeFalsy()
    })
  })

})
