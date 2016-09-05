
import { createFilter } from 'rollup-pluginutils'
import { extname } from 'path'

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object} opts? - The user options
 * @returns {function}     Filter function that returns true if a given
 *                         file matches the filter.
 */
export default function _createFilter (opts) {
  if (!opts) opts = {}

  const flt1 = createFilter(opts.include, opts.exclude)
  const flt2 = opts.extensions &&
    opts.extensions.map(e => (e[0] !== '.' ? '.' + e : e).toLowerCase()) || ['.js']

  return function (name) {
    return flt1(name) && flt2.indexOf(extname(name).toLowerCase()) > -1
  }
}
