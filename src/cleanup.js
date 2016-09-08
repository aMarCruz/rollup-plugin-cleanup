/* eslint no-debugger:0 */

import MagicString from 'magic-string'
import preproc from './preproc'
import postproc from './postproc'

export default function transform (code, file, options) {

  const magicStr = new MagicString(code)

  code = preproc(magicStr, code, file, options)

  if (postproc(magicStr, code, file, options)) {
    return {
      code: magicStr.toString(),
      map: options.sourceMap ? magicStr.generateMap({ hires: true }) : null
    }
  }
  return null
}
