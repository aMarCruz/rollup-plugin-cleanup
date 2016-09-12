
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

  const filt = createFilter(opts.include, opts.exclude)

  let exts = opts.extensions || ['.js', '.jsx', '.tag']
  if (exts !== '*') {
    if (!Array.isArray(exts)) exts = [exts]
    exts = exts.map(e => e[0] !== '.' ? '.' + e : e)
  }

  return function (name) {
    return filt(name) &&
      (exts === '*' || exts.indexOf(extname(name)) > -1)
  }
}
