import { createFilter } from 'rollup-pluginutils';
import { extname } from 'path';
import MagicString from 'magic-string';
import acorn from 'acorn';

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

  var filt = createFilter(opts.include, opts.exclude)

  var exts = opts.extensions || ['.js', '.jsx', '.tag']
  if (exts !== '*') {
    if (!Array.isArray(exts)) exts = [exts]
    exts = exts.map(function (e) { return e[0] !== '.' ? '.' + e : e; })
  }

  return function (name) {
    return filt(name) &&
      (exts === '*' || exts.indexOf(extname(name)) > -1)
  }
}

var _filters = {
  // only preserve license
  license:  /@license\b/,
  // (almost) like the uglify defaults
  some:     /(?:@license|@preserve|@cc_on)\b/,
  // http://usejsdoc.org/
  jsdoc:    /^\*\*[^@]*@[A-Za-z]/,
  // http://www.jslint.com/help.html
  jslint:   /^[\/\*](?:jslint|global|property)\b/,
  // http://jshint.com/docs/#inline-configuration
  jshint:   /^[\/\*]\s*(?:jshint|globals|exported)\s/,
  // http://eslint.org/docs/user-guide/configuring
  eslint:   /^[\/\*]\s*(?:eslint(?:\s|-env|-disable|-enable)|global\s)/,
  // http://jscs.info/overview
  jscs:     /^[\/\*]\s*jscs:[ed]/,
  // https://gotwarlost.github.io/istanbul/
  istanbul: /^[\/\*]\s*istanbul\s/,
  // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
  srcmaps:  /^.[#@]\ssource(?:Mapping)?URL=/
}

function parseOptions (options) {
  if (!options) options = {}

  // multiple forms tu specify comment filters, default is 'some'
  var comments = options.comments
  if (comments == null) {
    comments = [_filters.some]
  } else if (comments === 'all') {
    comments = true
  } else if (comments === 'none') {
    comments = false
  } else if (typeof comments != 'boolean') {
    var filters = Array.isArray(comments) ? comments : [comments]
    comments = []
    filters.forEach(function (f) {
      if (f instanceof RegExp) {
        comments.push(f)
      } else if (typeof f != 'string') {
        throw new Error('type mismatch in comment filter.')
      } else if (f in _filters) {
        comments.push(_filters[f])
      } else {
        throw new Error(("unknown comments filter \"" + f + "\""))
      }
    })
  }

  var normalizeEols = options.hasOwnProperty('normalizeEols')
                    ? options.normalizeEols : options.eolType
  if (normalizeEols !== false && normalizeEols !== 'win' && normalizeEols !== 'mac') {
    normalizeEols = 'unix'
  }

  return {
    ecmaVersion: options.ecmaVersion || 6,
    sourceMap: options.sourceMap !== false,
    sourceType: options.sourceType || 'module',
    maxEmptyLines: options.maxEmptyLines | 0,
    normalizeEols: normalizeEols,
    comments: comments
  }
}

/**
 * By using premaked string of spaces, blankBlock is faster than
 * block.replace(/[^ \n]+/, ' ').
 *
 * @const {string}
 * @static
 */
var space150 = new Array(151).join(' ')

/**
 * Replaces all characters in the clock with spaces, except line-feeds.
 *
 * @param   {string} block - The buffer to replace
 * @returns {string}         The replacement block.
 */
function blankBlock (block) {
  return block.replace(/[^\n\r]+/g, function (m) {
    var len = m.length
    var str = space150

    while (str.length < len) str += space150
    return str.slice(0, len)
  })
}

/* eslint no-debugger:0 */

function preproc (magicStr, code, file, options) {
  var comments = options.comments

  if (comments === true) {
    return code
  }

  try {
    acorn.parse(code, {
      ecmaVersion: options.ecmaVersion,
      sourceType: options.sourceType,
      onComment: blankComment
    })
  } catch (err) {
    err.message += " in " + file
    throw err
  }

  function blankComment (block, text, start, end) {
    if (comments !== false) {
      text = (block ? '*' : '/') + text
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].test(text)) return
      }
    }
    block = blankBlock(code.slice(start, end))
    code = code.slice(0, start) + block + code.slice(end)
  }

  return code
}

var EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' }
var FIRST_LINES = /^(\s*[\r\n])\s*\S/
var EMPTY_LINES = /(\s*[\r\n])\s*\S/g
var TRIM_LINES  = /[ \t\f\v]*(?:\r\n?|\n)/g


function postproc (magicStr, code, file, options) {

  var eolTo   = EOL_TYPES[options.normalizeEols]
  var empties = options.maxEmptyLines
  // matches one or more line endings and their leading spaces
  var regex   = EMPTY_LINES

  var maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0
  var match, block, changes

  // first empty lines
  match = code.match(FIRST_LINES)
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

  return changes

  // helpers ==============================================

  function replaceBlock (str, start, rep) {
    if (str === rep) return
    magicStr.overwrite(start, start + str.length, rep)
    changes = true
  }

  function limitLines (str) {
    var ss = str.replace(TRIM_LINES, eolTo)
    if (ss.length > maxEolChars) ss = ss.slice(0, maxEolChars)
    return ss
  }
}

/* eslint no-debugger:0 */

function transform (code, file, options) {

  var magicStr = new MagicString(code)

  code = preproc(magicStr, code, file, options)

  if (postproc(magicStr, code, file, options)) {
    return {
      code: magicStr.toString(),
      map: options.sourceMap ? magicStr.generateMap({ hires: true }) : null
    }
  }
  return null
}

/**
 * rollup-plugin-cleanup
 * @module
 */
function jspp (options) {
  if (!options) options = {}

  // merge include, exclude, and extensions
  var filter = _createFilter(options)

  // validate and clone the plugin options
  options = parseOptions(options)

  return {

    name: 'cleanup',

    transform: function transform$$ (code, id) {
      return filter(id)
        ? transform(code, id, options) : null
    }
  }
}

export default jspp;