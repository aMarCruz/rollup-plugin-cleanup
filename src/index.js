import cleanup from 'js-cleanup'
import createFilter from './create-filter'
import parseOptions from './parse-options'

/**
 * Returns the rollup-plugin-cleanup instance.
 * @param   {Object} options - Plugin's user options
 * @returns {Object} Plugin instance.
 */
const rollupCleanup = function (options) {
  options = options || {}

  // merge include, exclude, and extensions
  const filter = createFilter(options)

  // validate and clone the plugin options
  options = parseOptions(options)

  // the plugin instance
  return {

    name: 'cleanup',

    transform(code, id) {

      if (filter(id)) {
        return new Promise((resolve) => {
          try {
            resolve(cleanup(code, id, options))
          } catch (err) {
            // istanbul ignore else
            if ('position' in err && this.error) {
              this.error(err.message, err.position)
            } else {
              throw err
            }
          }
        })
      }

      return null
    },
  }
}

export default rollupCleanup
