/**
 * rollup-plugin-cleanup
 * @module
 */
import postproc from './postproc'
import createFilter from './util/filter'


export default function jspp (options) {

  // prepare extensions to match with the extname() result
  const filter = createFilter(options)

  return {

    name: 'cleanup',

    transform (code, id) {
      return filter(id)
        ? postproc(code, options)
        : null
    }
  }
}
