
const EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' }
const FIRST_LINES = /^(\s*[\r\n])\s*\S/
const EACH_LINE   = /.*(?:\r\n?|\n)/g
const TRIM_SPACES = /[^\S\r\n]+$/

export default function postproc (magicStr, code, file, options) {

  // matches one or more line endings and their leading spaces
  // (crating the regex here avoids set the lastIndex to 0)
  const NEXT_LINES = /\s*[\r\n]/g

  const eolTo   = EOL_TYPES[options.normalizeEols]
  const empties = options.maxEmptyLines

  let maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0
  let match, block
  let changes = false

  // first empty lines
  match = code.match(FIRST_LINES)
  if (match) {
    block = match[1]
    changes = replaceBlock(block, 0, limitLines(block))
    NEXT_LINES.lastIndex = match[0].length
  }

  // middle lines count one more
  maxEolChars += eolTo.length

  if (empties) {
    // maxEmptyLines -1 or > 0
    while ((match = NEXT_LINES.exec(code))) {
      block = match[0]
      changes = replaceBlock(block, match.index, limitLines(block))
    }
  } else {
    // removes all the empty lines
    while ((match = NEXT_LINES.exec(code))) {
      changes = replaceBlock(match[0], match.index, eolTo)
    }
  }

  // now, trim the last spaces not handled by previous regex
  match = code.match(TRIM_SPACES)
  if (match) {
    changes = replaceBlock(match[0], match.index, '')
  }

  return changes

  // helpers ==============================================

  function replaceBlock (str, start, rep) {
    if (str !== rep) {
      magicStr.overwrite(start, start + str.length, rep)
      changes = true
    }
    return changes
  }

  function limitLines (str) {
    let ss = str.replace(EACH_LINE, eolTo)
    if (ss.length > maxEolChars) ss = ss.slice(0, maxEolChars)
    return ss
  }
}
