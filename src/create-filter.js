
import { createFilter } from 'rollup-pluginutils'

const justExt = (file) => {
  const match = /[^/\\]\.([^./\\]*)$/.exec(file)
  return match ? match[1] : ''
}

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object} opts? - The user options
 * @returns {function}     Filter function that returns true if a given
 *                         file matches the filter.
 */
const _createFilter = function (opts) {

  const filter = createFilter(opts.include, opts.exclude)

  let exts = opts.extensions || ['js', 'jsx', 'mjs']
  if (Array.isArray(exts)) {
    exts = Array.from(exts)
  } else {
    exts = [exts]
  }

  for (let i = 0; i < exts.length; i++) {
    const e = exts[i]
    if (e === '*') {
      return filter
    }
    if (e[0] === '.') {
      exts[i] = e.substr(1)
    }
  }

  return (name) => (filter(name) && exts.indexOf(justExt(name)) > -1)
}

export default _createFilter
