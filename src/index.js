/**
 * rollup-plugin-cleanup
 * @module
 */
import createFilter from './util/filter'
import parseOptions from './parse-options'
import cleanup from './cleanup'

export default function rollupCleanup(options) {
  if (!options) options = {}

  // merge include, exclude, and extensions
  const filter = createFilter(options)

  // validate and clone the plugin options
  const opts = parseOptions(options)

  return {

    name: 'cleanup',

    transform(code, id) {
      return filter(id) ? cleanup(code, id, opts) : null
    }
  }
}
