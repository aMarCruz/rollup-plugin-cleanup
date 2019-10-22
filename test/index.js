'use strict'

const rollup  = require('rollup').rollup
const cleanup = require('../')
const expect  = require('expect')
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
  expect(promise).toBeA(Promise)

  return promise.then((result) => {
    expect(result && result.code).toBe(expected)
  })
}

function testFile(file, opts, fexp, save) { // eslint-disable-line max-params
  const fname     = concat(file, 'fixtures')
  const expected  = fexp === null ? null : fs.readFileSync(concat(fexp || file), 'utf8')
  const code      = fs.readFileSync(fname, 'utf8')
  const promise   = cleanup(opts).transform(code, fname)

  if (fexp === null) {
    return expect(promise).toBe(null)
  }

  expect(promise).toBeA(Promise)
  return promise.then((result) => {
    if (save && result) {
      fs.writeFileSync(concat(file + '_out'), result.code, 'utf8')
    }
    expect(result && result.code).toBe(expected)
  })
}

// ===========================================================================

describe('rollup-plugin-cleanup', function () {

  const emptyLines10 = '\n\n\n\n\n\n\n\n\n\n'
  const emptyLinesTop = emptyLines10 + 'X'
  const emptyLinesBottom = 'X' + emptyLines10
  const emptyLinesMiddle = emptyLines10 + 'X' + emptyLines10 + 'X' + emptyLines10
  const emptyLinesTemplate = emptyLines10 + '`' + emptyLines10 + '`' + emptyLines10

  it('by default removes all the empty lines and normalize to unix', function () {
    return testLines([
      '',
      'abc ',
      'x\t',
      '\r\ny \r',
      '\n\n\r\t',
      'z ',
    ].join('\n'), 'abc\nx\ny\nz')
  })

  it('do not touch current indentation of non-empty lines', function () {
    return testLines('  \n X\n  X ', ' X\n  X')
  })

  it('has fine support for empty lines with `maxEmptyLines`', function () {
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

  it('can keep all the lines by setting `maxEmptyLines` = -1', function () {
    return Promise.all([
      testLines(emptyLinesTop, emptyLinesTop, -1),
      testLines(emptyLinesBottom, emptyLinesBottom, -1),
      testLines(emptyLinesMiddle, emptyLinesMiddle, -1),
      testLines(emptyLinesTemplate, emptyLinesTemplate, -1),
    ])
  })

  it('can convert to Windows line-endings with `normalizeEols` = "win"', function () {
    const opts = { maxEmptyLines: 1, normalizeEols: 'win' }
    return Promise.all([
      testLines(emptyLinesTop, '\r\nX', opts),
      testLines(emptyLinesBottom, 'X\r\n\r\n', opts),
      testLines(emptyLinesMiddle, '\r\nX\r\n\r\nX\r\n\r\n', opts),
      testLines(emptyLinesTemplate, '\r\n`' + emptyLines10 + '`\r\n\r\n', opts),
    ])
  })

  it('and convertion to Mac line-endings with `normalizeEols` = "mac"', function () {
    const opts = { maxEmptyLines: 1, normalizeEols: 'mac' }
    return Promise.all([
      testLines(emptyLinesTop, '\rX', opts),
      testLines(emptyLinesBottom, 'X\r\r', opts),
      testLines(emptyLinesMiddle, '\rX\r\rX\r\r', opts),
      testLines(emptyLinesTemplate, '\r`' + emptyLines10 + '`\r\r', opts),
    ])
  })

  it('makes normalization to the desired `normalizeEols` line-endings', function () {
    const opts = { maxEmptyLines: -1, normalizeEols: 'mac' }
    return testLines('\r\n \n\r \r\r\n \r\r \n', '\r\r\r\r\r\r\r\r', opts)
  })

  it('handles ES7', function () {
    return testFile('es7')
  })

  it('throws with the rollup `this.error` method.', function () {
    const opts = {
      input: 'fixtures/with_error.js',
      plugins: [cleanup()],
    }

    return rollup(opts).catch((err) => {
      expect(err.code).toBe('PLUGIN_ERROR')
      expect(err).toIncludeKey('loc').toBeA(Object)
    })
  })

})


describe('Removing comments', function () {

  it('with `comments: ["some", "eslint"]', function () {
    return testFile('defaults', {
      comments: ['some', 'eslint'],
    })
  })

  it('with `comments: "none"`', function () {
    return testFile('defaults', { comments: 'none' }, 'comments_none')
  })

  it('with `comments: false`', function () {
    return testFile('defaults', { comments: false }, 'comments_none')
  })

  it('with `comments: true`', function () {
    return testFile('defaults', { comments: true }, 'comments_all')
  })

  it('with `comments: /@preserve/`', function () {
    return testFile('defaults', { comments: /@preserve/ }, 'comments_regex')
  })

  it('with long comments', function () {
    return testFile('long_comment')
  })

  it('with no changes due normalization nor emptyLines', function () {
    return testFile('comments')
  })

  it('with "ts3s" preserves TypeScript Triple-Slash directives.', function () {
    return testFile('ts3s', { comments: 'ts3s' })
  })

  it('"srcmaps" is an alias to "sources"', function () {
    const opts = { comments: 'srcmaps' }
    const lines = [
      '//',
      '0',
      '//# sourceURL=a.map',
      '//# sourceMappingURL=a.js.map',
    ]
    return testLines(lines.join('\n'), lines.slice(1).join('\n'), opts)
  })

  it('throws on unknown filters', function () {
    return expect(() => {
      cleanup({ comments: 'foo' })
    }).toThrow('unknown')
  })

})


describe('Extension handling', function () {

  it('with `extensions: ["*"] must process all extensions', function () {
    return testFile('extensions.foo', {
      extensions: ['*'],
    })
  })

  it('with specific `extensions` must process given extensions', function () {
    return testFile('extensions.foo', {
      extensions: 'foo',
    })
  })

  it('must skip non listed extensions', function () {
    return testFile('comments', { extensions: 'foo' }, null)
  })

  it('must handle empty extensions', function () {
    const opts = { extensions: '.', sourcemap: false }
    const source = 'A'
    expect(cleanup(opts).transform(source, 'a.ext')).toBe(null)

    const promise = cleanup(opts).transform(source, 'no-ext')
    expect(promise).toBeA(Promise)
    return promise.then((result) => {
      expect(result.code).toBe(source)
    })
  })

})


describe('Issues', function () {

  it('must handle .jsx files (issue #1)', function () {
    const jsx  = require('rollup-plugin-jsx')
    const opts = {
      input: 'fixtures/issue_1.jsx',
      plugins: [
        jsx({ factory: 'React.createElement' }),
        cleanup(),
      ],
      external: ['react'],
    }

    return rollup(opts).then((bundle) =>
      bundle.generate({ format: 'cjs' }).then((result) => {
        expect(result.code).toMatch(/module\.exports/)
        expect(result.code).toNotMatch(/to_be_removed/)
        expect(result.map).toNotExist()
      })
    )
  })

  it('must support spread operator by default (issue #10)', function () {
    return testFile('issue_10')
  })

  it('must support import() by default (issue #11)', function () {
    return testFile('issue_11')
  })

  it('#15 must handle "$" ending the string', function () {
    const opts = {
      sourceMap: false,
    }
    /* eslint-disable no-template-curly-in-string */
    const result = [
      'const s = `${v}$`',
      'const s = `$${v}$`',
      'const s = `${v}$$`',
      'const s = `\\$`',
      'const s = `$0`',
      'const s = `$$`',
      'const s = `$`',
    ].map(function (str) {
      return cleanup(opts).transform(str, 'a.js').then((res) => {
        expect(res.code).toBe(str)
      })
    })
    /* eslint-enable no-template-curly-in-string */
    return Promise.all(result)
  })

  it.only('must handle large libraries', function () {
    const filename = 'issue_17.js'
    return rollup({
      input: concat(filename, 'fixtures'),
      plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')({ 'include': '../node_modules/**' }),
        cleanup({ sourceMap: false }),
      ],
    }).then((bundle) => {
      return bundle.generate({ format: 'iife' })
    }).then((result) => {
      const expected = fs.readFileSync('maps/output.js', 'utf8')
      expect(result.code).toBe(expected, 'Generated code is incorrect!')
    })
  })

})


describe('SourceMap support', function () {

  const validator = require('sourcemap-validator')
  const buble = require('rollup-plugin-buble')

  it('bundle generated by rollup w/sourcemap', function () {

    return rollup({
      input: 'maps/bundle-src.js',
      plugins: [
        buble(),
        cleanup(),
      ],
    }).then(function (bundle) {

      return bundle.generate({
        format: 'iife',
        indent: true,
        name: 'myapp',
        sourcemap: true,
        sourcemapFile: 'maps/bundle.js', // generates source filename w/o path
        banner: '/*\n  plugin version 1.0\n*/\n/*eslint-disable*/',
        footer: '/* follow me on Twitter! @amarcruz */',
      }).then((result) => {
        const code = result.code
        const expected = fs.readFileSync('maps/output.js', 'utf8')

        expect(code).toBe(expected, 'Generated code is incorrect!')
        expect(result.map).toBeAn(Object).toExist()
        validator(code, JSON.stringify(result.map))
      })

    })
  })

  it('must skip sourcemap generation with `sourceMap: false`', function () {
    const fname   = 'fixtures/defaults.js'
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourceMap: false }).transform(code, fname)
    expect(promise).toBeA(Promise)

    return promise.then((result) => {
      expect(result.map).toNotExist()
    })
  })

  it('must skip sourcemap generation with `sourcemap: false` (lowercase)', function () {
    const fname   = 'fixtures/defaults.js'
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourcemap: false }).transform(code, fname)
    expect(promise).toBeA(Promise)

    return promise.then((result) => {
      expect(result.map).toNotExist()
    })
  })

})
