
const _filters = {
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

export default function parseOptions (options) {
  if (!options) options = {}

  // multiple forms tu specify comment filters, default is 'some'
  let comments = options.comments
  if (comments == null) {
    comments = [_filters.some]
  } else if (comments === 'all') {
    comments = true
  } else if (comments === 'none') {
    comments = false
  } else if (typeof comments != 'boolean') {
    let filters = Array.isArray(comments) ? comments : [comments]
    comments = []
    filters.forEach(f => {
      if (f instanceof RegExp) {
        comments.push(f)
      } else if (typeof f != 'string') {
        throw new Error('type mismatch in comment filter.')
      } else if (f in _filters) {
        comments.push(_filters[f])
      } else {
        throw new Error(`unknown comments filter "${ f }"`)
      }
    })
  }

  let normalizeEols = options.hasOwnProperty('normalizeEols')
                    ? options.normalizeEols : options.eolType
  if (normalizeEols !== false && normalizeEols !== 'win' && normalizeEols !== 'mac') {
    normalizeEols = 'unix'
  }

  return {
    ecmaVersion: options.ecmaVersion || 6,
    sourceMap: options.sourceMap !== false,
    sourceType: options.sourceType || 'module',
    maxEmptyLines: options.maxEmptyLines | 0,
    normalizeEols,
    comments
  }
}
