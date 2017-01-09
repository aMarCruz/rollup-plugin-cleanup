'use strict';

var rollupPluginutils = require('rollup-pluginutils');
var path = require('path');
var MagicString = require('magic-string');
var acorn = require('acorn');

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object} opts? - The user options
 * @returns {function}     Filter function that returns true if a given
 *                         file matches the filter.
 */
function _createFilter (opts) {

  var filt = rollupPluginutils.createFilter(opts.include, opts.exclude);

  var exts = opts.extensions || ['.js', '.jsx', '.tag'];
  if (!Array.isArray(exts)) { exts = [exts]; }
  for (var i = 0; i < exts.length; i++) {
    var e = exts[i];
    if (e === '*') {
      exts = '*';
      break
    } else if (e[0] !== '.') {
      exts[i] = '.' + e;
    }
  }

  return function (name) {
    return filt(name) &&
      (exts === '*' || exts.indexOf(path.extname(name)) > -1)
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
};

function parseOptions (options) {

  // multiple forms tu specify comment filters, default is 'some'
  var comments = options.comments;
  if (comments == null) {
    comments = [_filters.some];
  } else if (typeof comments != 'boolean') {
    var filters = Array.isArray(comments) ? comments : [comments];
    comments = [];
    for (var i = 0; i < filters.length; i++) {
      var f = filters[i];
      if (f instanceof RegExp) {
        comments.push(f);
      } else if (f === 'all') {
        comments = true;
        break
      } else if (f === 'none') {
        comments = false;
        break
      } else if (f in _filters) {
        comments.push(_filters[f]);
      } else {
        throw new Error(("unknown comment filter: \"" + f + "\""))
      }
    }
  }

  var normalizeEols = options.hasOwnProperty('normalizeEols')
                    ? options.normalizeEols : options.eolType;
  if (normalizeEols !== false && normalizeEols !== 'win' && normalizeEols !== 'mac') {
    normalizeEols = 'unix';
  }

  return {
    ecmaVersion: options.ecmaVersion || 8,
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
var space150 = new Array(151).join(' ');

/**
 * Replaces all characters in the clock with spaces, except line-feeds.
 *
 * @param   {string} block - The buffer to replace
 * @returns {string}         The replacement block.
 */
function blankBlock (block) {
  return block.replace(/[^\n\r]+/g, function (m) {
    var len = m.length;
    var str = space150;

    while (str.length < len) { str += space150; }
    return str.slice(0, len)
  })
}

function preproc (magicStr, code, file, options) {
  var comments = options.comments;

  if (comments === true) {
    return null
  }

  try {
    acorn.parse(code, {
      ecmaVersion: options.ecmaVersion,
      sourceType: options.sourceType,
      onComment: blankComment
    });
  } catch (err) {
    err.message += " in " + file;
    throw err
  }

  function blankComment (block, text, start, end) {
    if (comments !== false) {
      text = (block ? '*' : '/') + text;
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].test(text)) { return }
      }
    }
    block = blankBlock(code.slice(start, end));
    code = code.slice(0, start) + block + code.slice(end);
  }

  return code
}

var EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' };
var FIRST_LINES = /^(\s*[\r\n])\s*\S/;
var EACH_LINE   = /.*(?:\r\n?|\n)/g;
var TRIM_SPACES = /[^\S\r\n]+$/;

function postproc (magicStr, code, file, options) {

  // matches one or more line endings and their leading spaces
  // (crating the regex here avoids set the lastIndex to 0)
  var NEXT_LINES = /\s*[\r\n]/g;

  var eolTo   = EOL_TYPES[options.normalizeEols];
  var empties = options.maxEmptyLines;

  var maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0;
  var match, block;
  var changes = false;

  // first empty lines
  match = code.match(FIRST_LINES);
  if (match) {
    block = match[1];
    changes = replaceBlock(block, 0, limitLines(block));
    NEXT_LINES.lastIndex = match[0].length;
  }

  // middle lines count one more
  maxEolChars += eolTo.length;

  if (empties) {
    // maxEmptyLines -1 or > 0
    while ((match = NEXT_LINES.exec(code))) {
      block = match[0];
      changes = replaceBlock(block, match.index, limitLines(block));
    }
  } else {
    // removes all the empty lines
    while ((match = NEXT_LINES.exec(code))) {
      changes = replaceBlock(match[0], match.index, eolTo);
    }
  }

  // now, trim the last spaces not handled by previous regex
  match = code.match(TRIM_SPACES);
  if (match) {
    changes = replaceBlock(match[0], match.index, '');
  }

  return changes

  // helpers ==============================================

  function replaceBlock (str, start, rep) {
    if (str !== rep) {
      magicStr.overwrite(start, start + str.length, rep);
      changes = true;
    }
    return changes
  }

  function limitLines (str) {
    var ss = str.replace(EACH_LINE, eolTo);
    if (ss.length > maxEolChars) { ss = ss.slice(0, maxEolChars); }
    return ss
  }
}

/* eslint no-debugger:0 */

function transform (code, file, options) {

  var magicStr = new MagicString(code);

  var code2 = preproc(magicStr, code, file, options);

  if (postproc(magicStr, code2 || code, file, options)) {
    return {
      code: magicStr.toString(),
      map: options.sourceMap ? magicStr.generateMap({ hires: true }) : null
    }
  }
  return code2
}

/**
 * rollup-plugin-cleanup
 * @module
 */
function jspp (options) {
  if (!options) { options = {}; }

  // merge include, exclude, and extensions
  var filter = _createFilter(options);

  // validate and clone the plugin options
  options = parseOptions(options);

  return {

    name: 'cleanup',

    transform: function transform$$1 (code, id) {
      return filter(id)
        ? transform(code, id, options) : null
    }
  }
}

module.exports = jspp;
