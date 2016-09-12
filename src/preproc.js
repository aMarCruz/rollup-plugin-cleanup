/* eslint no-debugger:0 */

import acorn from 'acorn'
import blankBlock from './blank-block'


export default function preproc (magicStr, code, file, options) {
  const comments = options.comments

  if (comments === true) {
    return code
  }

  try {
    acorn.parse(code, {
      ecmaVersion: options.ecmaVersion,
      sourceType: options.sourceType,
      onComment: blankComment
    })
  } catch (err) {
    err.message += ` in ${file}`
    throw err
  }

  function blankComment (block, text, start, end) {
    if (comments !== false) {
      text = (block ? '*' : '/') + text
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].test(text)) return
      }
    }
    block = blankBlock(code.slice(start, end))
    code = code.slice(0, start) + block + code.slice(end)
  }

  return code
}
