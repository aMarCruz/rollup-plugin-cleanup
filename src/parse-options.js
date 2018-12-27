import cleanup from 'js-cleanup'

// Support for deprecated filters
const translateFilter = function (item, ix, arr) {
  switch (item) {
    case 'srcmaps':
      arr[ix] = 'sources'
      break
    // istanbul ignore next
    case 'jscs':
      arr[ix] = /^[/*]\s*jscs:[ed]/
      break
  }
}

// multiple forms to specify comment filters, default is 'some'
const getFilters = (filters) => {

  if (typeof filters === 'boolean') {
    return filters === true ? 'all' : 'none'
  }

  if (filters) {
    filters = Array.isArray(filters) ? filters : [filters]
    filters.forEach(translateFilter)
    // throws on unknown filters
    cleanup('', null, { comments: filters, sourcemap: false })
  }

  return filters || 'some'
}

const parseOptions = (options) => {
  const comments = getFilters(options.comments)

  return {
    comments,
    compactComments: options.compactComments !== false,
    lineEndings: options.lineEndings || options.normalizeEols,
    maxEmptyLines: options.maxEmptyLines | 0,
    sourcemap: options.sourceMap !== false && options.sourcemap !== false,
  }
}

export default parseOptions
