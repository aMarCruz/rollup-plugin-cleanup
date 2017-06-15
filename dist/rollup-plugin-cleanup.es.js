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
function _createFilter(opts) {

  var filt = createFilter(opts.include, opts.exclude);

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
      (exts === '*' || exts.indexOf(extname(name)) > -1)
  }
}

/* eslint no-useless-escape:0 */

var _filters = {
  // only preserve license
  license:  /@license\b/,
  // (almost) like the uglify defaults
  some:     /(?:@license|@preserve|@cc_on)\b/,
  // http://usejsdoc.org/
  jsdoc:    /^\*\*[^@]*@[A-Za-z]/,
  // http://www.jslint.com/help.html
  jslint:   /^[/\*](?:jslint|global|property)\b/,
  // http://jshint.com/docs/#inline-configuration
  jshint:   /^[/\*]\s*(?:jshint|globals|exported)\s/,
  // http://eslint.org/docs/user-guide/configuring
  eslint:   /^[/\*]\s*(?:eslint(?:\s|-env|-disable|-enable)|global\s)/,
  // https://palantir.github.io/tslint/usage/rule-flags/
  ts3s:     /^\/\/[ \t]*<(?:reference\s|amd-).*>/,
  // http://jscs.info/overview
  jscs:     /^[/\*]\s*jscs:[ed]/,
  // https://gotwarlost.github.io/istanbul/
  istanbul: /^[/\*]\s*istanbul\s/,
  // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
  srcmaps:  /^.[#@]\ssource(?:Mapping)?URL=/
};

var parseOptions = function (options) {

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
};

/**
 * By using a premaked block of spaces, blankBlock is faster than
 * simple block.replace(/[^ \n]+/, ' ').
 *
 * @const {string}
 * @private
 */
var _spaces = new Array(150).join(' ');

/**
 * Matches non-EOL characteres.
 * @const
 * @private
 */
var NOBLANK = /[^\n\r]+/g;

/**
 * Replaces all the non-EOL characters in the block with spaces.
 *
 * @param   {string} block - The buffer to replace
 * @returns {string}         The replaced block.
 * @private
 */
function blankBlock(block) {
  var len = block.length;

  var spaces = _spaces;
  while (spaces.length < len) {
    spaces += _spaces;
  }

  return spaces.slice(0, len)
}

/**
 * Replaces the comments with spaces.
 *
 * @param {string} code - JS code
 * @param {string} file - Name of the file being processed
 * @param {object} options - User options
 * @prop {boolean|RegExp[]} options.comments - Comment filters
 * @returns {string} The processed code
 */
var blankComments = function (code, file, options) {
  var comments = options.comments;

  var onComment = function (block, text, start, end) {
    if (comments !== false) {
      text = (block ? '*' : '/') + text;
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].test(text)) { return }
      }
    }
    text = code.slice(start, end).replace(NOBLANK, blankBlock);
    code = code.slice(0, start) + text + code.slice(end);
  };

  // Now replace the comments. As blankComment will not change code
  // positions, trimming empty lines will be easy.
  try {
    acorn.parse(code, {
      ecmaVersion: options.ecmaVersion,
      sourceType: options.sourceType,
      onComment: onComment
    });
  } catch (err) {
    err.message += " in " + file;
    throw err
  }

  return code
};

var EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' };
var FIRST_LINES = /^(\s*[\r\n])\s*\S/;
var EACH_LINE   = /.*(?:\r\n?|\n)/g;
var TRIM_SPACES = /[^\S\r\n]+$/;

var removeLines = function (magicStr, code, file, options) {

  // matches one or more line endings and their leading spaces
  // (creating the regex here avoids set the lastIndex to 0)
  var NEXT_LINES = /\s*[\r\n]/g;

  var eolTo   = EOL_TYPES[options.normalizeEols];
  var empties = options.maxEmptyLines;

  var maxEolChars = empties < 0 ? Infinity : empties ? empties * eolTo.length : 0;
  var match, block;
  var changes = false;

  // helpers ==============================================

  var replaceBlock = function (str, start, rep) {
    if (str !== rep) {
      magicStr.overwrite(start, start + str.length, rep);
      changes = true;
    }
  };

  var limitLines = function (str) {
    var ss = str.replace(EACH_LINE, eolTo);
    if (ss.length > maxEolChars) { ss = ss.slice(0, maxEolChars); }
    return ss
  };

  // first empty lines
  match = code.match(FIRST_LINES);
  if (match) {
    block = match[1];
    replaceBlock(block, 0, limitLines(block));
    NEXT_LINES.lastIndex = match[0].length;
  }

  // middle lines count one more
  maxEolChars += eolTo.length;

  if (empties) {
    // maxEmptyLines -1 or > 0
    while ((match = NEXT_LINES.exec(code))) {
      block = match[0];
      replaceBlock(block, match.index, limitLines(block));
    }
  } else {
    // removes all the empty lines
    while ((match = NEXT_LINES.exec(code))) {
      replaceBlock(match[0], match.index, eolTo);
    }
  }

  // now, trim the last spaces not handled by previous regex
  match = code.match(TRIM_SPACES);
  if (match) {
    replaceBlock(match[0], match.index, '');
  }

  return changes
};

/* eslint no-debugger:0 */

function cleanup(source, file, options) {
  var changes;
  var code;

  if (options.comments === true) {
    code = source;
  } else {
    code = blankComments(source, file, options);
    changes = code !== source;
  }

  var magicStr = new MagicString(code);

  changes = removeLines(magicStr, code, file, options) || changes;

  if (changes) {
    return {
      code: magicStr.toString(),
      map: options.sourceMap ? magicStr.generateMap({ hires: true }) : null
    }
  }

  return null     // tell to Rollup that discard this result
}

/**
 * rollup-plugin-cleanup
 * @module
 */
function rollupCleanup(options) {
  if (!options) { options = {}; }

  // merge include, exclude, and extensions
  var filter = _createFilter(options);

  // validate and clone the plugin options
  var opts = parseOptions(options);

  return {

    name: 'cleanup',

    transform: function transform(code, id) {
      return filter(id) ? cleanup(code, id, opts) : null
    }
  }
}

export default rollupCleanup;
