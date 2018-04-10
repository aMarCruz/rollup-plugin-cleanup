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
    if (typeof lines == 'object') Object.assign(options, lines)
    else options.maxEmptyLines = lines
  }

  const promise = cleanup(options).transform(code, 'test.js')
  expect(promise).not.toBeNull()

  return promise.then(result => {
    expect(result == null ? null : result.code).toBe(expected)
  })
}


function testFile(file, opts, save, fexp) {
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
      'z '
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
      testLines(emptyLinesTop, null, -1),
      testLines(emptyLinesBottom, null, -1),
      testLines(emptyLinesMiddle, null, -1),
      testLines(emptyLinesTemplate, null, -1),
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


  test('skip source map generation with `sourceMap: false`', function () {
    const fname   = concat('defaults', 'fixtures')
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourceMap: false }).transform(code, fname)
    expect(promise).toBeTruthy()

    return promise.then(result => {
      expect(result.map).toBeFalsy()
    })
  })


  test('skip source map generation with `sourcemap: false` (lowercase)', function () {
    const fname   = concat('defaults', 'fixtures')
    const code    = fs.readFileSync(fname, 'utf8')
    const promise = cleanup({ sourcemap: false }).transform(code, fname)
    expect(promise).toBeTruthy()

    return promise.then(result => {
      expect(result.map).toBeFalsy()
    })
  })


  test('throws on Acorn errors', function () {
    const fname = concat('with_error', 'fixtures')
    const code  = fs.readFileSync(fname, 'utf8')

    return expect(cleanup().transform(code, fname)).rejects.toBeDefined()
  })


  test('throws with the rollup `this.error` method.', function () {
    const opts = {
      input: 'fixtures/with_error.js',
      sourcemap: false,
      plugins: [cleanup()]
    }

    expect.assertions(1)
    return rollup(opts).catch(err => {
      expect(err.code).toBe('PLUGIN_ERROR')
    })
  })

})


describe('Removing comments', function () {

  test('with `comments: ["some", "eslint"]', function () {
    return testFile('defaults', {
      comments: ['some', 'eslint']
    })
  })


  test('with `comments: "none"`', function () {
    return testFile('defaults', { comments: 'none' }, false, 'comments_none')
  })


  test('with `comments: false`', function () {
    return testFile('defaults', { comments: false }, false, 'comments_none')
  })


  test('with `comments: true`', function () {
    return testFile('defaults', { comments: true }, false, 'comments_all')
  })


  test('with `comments: /@preserve/`', function () {
    return testFile('defaults', { comments: /@preserve/ }, false, 'comments_regex')
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


  test('throws on unknown filters', function () {
    expect(() => { cleanup({ comments: 'foo' }) }).toThrow()
  })

})


describe('Extension handling', function () {

  test('with `extensions: ["*"] must process all extensions', function () {
    return testFile('extensions.foo', {
      extensions: ['*']
    })
  })


  test('with specific `extensions` must process given extensions', function () {
    return testFile('extensions.foo', {
      extensions: 'foo'
    })
  })


  test('must skip non listed extensions', function () {
    return testFile('comments', { extensions: 'foo' }, false, null)
  })

})


describe('Support for post-procesing', function () {

  test('of .jsx files (issue #1)', function () {
    const jsx  = require('rollup-plugin-jsx')
    const opts = {
      input: 'fixtures/issue_1.jsx',
      sourcemap: false,
      plugins: [
        jsx({
          factory: 'React.createElement'
        }),
        cleanup()
      ],
      external: ['react']
    }

    return rollup(opts).then(bundle =>
      bundle.generate({ format: 'cjs' }).then(result => {
        expect(result.code).toMatch(/module.exports/)
        expect(result.code).not.toMatch(/to_be_removed/)
        expect(result.map).toBeFalsy()
      })
    )
  })


  test('of riot .tag files', function () {
    const riot = require('rollup-plugin-riot')
    const opts = {
      input: 'fixtures/todo.tag',
      sourcemap: false,
      plugins: [
        riot(),
        cleanup()
      ],
      external: ['riot']
    }

    return rollup(opts).then(bundle =>
      bundle.generate({ format: 'cjs' }).then(result => {
        expect(result.code).toMatch(/riot\.tag2\(/)
      })
    )
  })

})


describe('SourceMap support', function () {

  const buble = require('rollup-plugin-buble')

  test('bundle generated by rollup w/inlined sourcemap', function () {

    return rollup({
      input: concat('bundle-src.js', 'maps'),
      sourcemap: true,
      plugins: [
        buble(),
        cleanup({
          comments: ['some', 'eslint']
        })
      ]
    }).then(function (bundle) {

      return bundle.generate({
        format: 'iife',
        indent: true,
        name: 'myapp',
        sourcemap: 'inline',
        sourcemapFile: 'maps/bundle.js', // generates sorce filename w/o path
        banner: '/*\n plugin version 1.0\n*/',
        footer: '/* follow me on Twitter! @amarcruz */'
      }).then(result => {
        const code = result.code + '\n//# source' + 'MappingURL=' + result.map.toUrl()
        /*
          If you modified the source in maps/bundle-src.js, you
          need to write the bundle and test it in the browser again.
        */
        //console.log('\t--- writing bundle with inlined sourceMap...')
        //fs.writeFileSync(concat('bundle', 'maps'), code, 'utf8')

        const expected = fs.readFileSync(concat('bundle', 'maps'), 'utf8')
        expect(code).toBe(expected, 'Genereted code is incorrect!')
      })

    })
  })

})
