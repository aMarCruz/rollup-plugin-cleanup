'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var MagicString = _interopDefault(require('magic-string'));
var rollupPluginutils = require('rollup-pluginutils');
var path = require('path');

function postproc (code, opts) {
  if (!opts) opts = {}

  if (opts.cleanup === false) {
    return { code: code }
  }
  opts.sourceMap = opts.sourceMap !== false

  const magicStr = new MagicString(code)

  const eolTo   = opts.eolType === 'win' ? '\r\n' : opts.eolType === 'mac' ? '\r' : '\n'
  const empties = opts.maxEmptyLines

  let maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0

  // matches one or more line endings and their leading spaces
  const regex = /(\s*[\r\n])\s*\S/g

  let match, block, changes

  // first empty lines
  match = code.match(/^(\s*[\r\n])\s*\S/)
  if (match) {
    block = match[1]
    replaceBlock(block, 0, limitLines(block))
    regex.lastIndex = match[0].length
  }

  // middle lines count one more
  maxEolChars += eolTo.length

  if (empties) {
    // maxEmptyLines -1 or > 0
    while ((match = regex.exec(code))) {
      block = match[1]
      replaceBlock(block, match.index, limitLines(block))
    }
  } else {
    // removes all the empty lines
    while ((match = regex.exec(code))) {
      replaceBlock(match[1], match.index, eolTo)
    }
  }

  // now, trim the last line(s)
  match = code.match(/\s+$/)
  if (match) {
    block = match[0]
    replaceBlock(block, match.index, /[\r\n]/.test(block) ? limitLines(block) : '')
  }

  let result = {
    code: changes ? magicStr.toString() : code
  }
  if (changes && opts.sourceMap) {
    result.map = magicStr.generateMap({ hires: true })
  }
  return result

  // helpers ==============================================

  function replaceBlock (str, start, rep) {
    if (str === rep) return
    magicStr.overwrite(start, start + str.length, rep)
    changes = true
  }

  function limitLines (str) {
    let ss = str.replace(/[ \t]*(?:\r\n?|\n)/g, eolTo)
    if (ss.length > maxEolChars) ss = ss.slice(0, maxEolChars)
    return ss
  }
}

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object} opts? - The user options
 * @returns {function}     Filter function that returns true if a given
 *                         file matches the filter.
 */
function _createFilter (opts) {
  if (!opts) opts = {}

  const flt1 = rollupPluginutils.createFilter(opts.include, opts.exclude)
  const flt2 = opts.extensions &&
    opts.extensions.map(e => (e[0] !== '.' ? '.' + e : e).toLowerCase()) || ['.js']

  return function (name) {
    return flt1(name) && flt2.indexOf(path.extname(name).toLowerCase()) > -1
  }
}

/**
 * rollup-plugin-cleanup
 * @module
 */
function jspp (options) {

  // prepare extensions to match with the extname() result
  const filter = _createFilter(options)

  return {

    name: 'cleanup',

    transform (code, id) {
      return filter(id)
        ? postproc(code, options)
        : null
    }
  }
}

module.exports = jspp;