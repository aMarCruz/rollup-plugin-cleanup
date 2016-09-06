import MagicString from 'magic-string';
import { createFilter } from 'rollup-pluginutils';
import { extname } from 'path';

function postproc (code, opts) {
  if (!opts) opts = {}

  if (opts.cleanup === false) {
    return { code: code }
  }
  opts.sourceMap = opts.sourceMap !== false

  var magicStr = new MagicString(code)

  var eolTo   = opts.eolType === 'win' ? '\r\n' : opts.eolType === 'mac' ? '\r' : '\n'
  var empties = opts.maxEmptyLines

  var maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0

  // matches one or more line endings and their leading spaces
  var regex = /(\s*[\r\n])\s*\S/g

  var match, block, changes

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

  var result = {
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
    var ss = str.replace(/[ \t]*(?:\r\n?|\n)/g, eolTo)
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

  var flt1 = createFilter(opts.include, opts.exclude)
  var flt2 = opts.extensions &&
    opts.extensions.map(function (e) { return (e[0] !== '.' ? '.' + e : e).toLowerCase(); }) || ['.js']

  return function (name) {
    return flt1(name) && flt2.indexOf(extname(name).toLowerCase()) > -1
  }
}

/**
 * rollup-plugin-cleanup
 * @module
 */
function jspp (options) {

  // prepare extensions to match with the extname() result
  var filter = _createFilter(options)

  return {

    name: 'cleanup',

    transform: function transform (code, id) {
      return filter(id)
        ? postproc(code, options)
        : null
    }
  }
}

export default jspp;