
const EOL_TYPES   = { unix: '\n', mac: '\r', win: '\r\n' }
const FIRST_LINES = /^(\s*[\r\n])\s*\S/
const EMPTY_LINES = /(\s*[\r\n])\s*\S/g
const TRIM_LINES  = /[ \t\f\v]*(?:\r\n?|\n)/g


export default function postproc (magicStr, code, file, options) {

  const eolTo   = EOL_TYPES[options.normalizeEols]
  const empties = options.maxEmptyLines
  // matches one or more line endings and their leading spaces
  const regex   = EMPTY_LINES

  let maxEolChars = empties < 0 ? 0x7fffffff : empties ? empties * eolTo.length : 0
  let match, block, changes

  // first empty lines
  match = code.match(FIRST_LINES)
  if (match) {
    block = match[1]
    replaceBlock(block, 0, limitLines(block))
    regex.lastIndex = match[0].length
  }

  // middle lines count one more
  maxEolChars += eolTo.length

  if (empties) {
    // maxEmptyLines -1 or > 0
    while ((match = regex.exec(code))) {
      block = match[1]
      replaceBlock(block, match.index, limitLines(block))
    }
  } else {
    // removes all the empty lines
    while ((match = regex.exec(code))) {
      replaceBlock(match[1], match.index, eolTo)
    }
  }

  // now, trim the last line(s)
  match = code.match(/\s+$/)
  if (match) {
    block = match[0]
    replaceBlock(block, match.index, /[\r\n]/.test(block) ? limitLines(block) : '')
  }

  return changes

  // helpers ==============================================

  function replaceBlock (str, start, rep) {
    if (str === rep) return
    magicStr.overwrite(start, start + str.length, rep)
    changes = true
  }

  function limitLines (str) {
    let ss = str.replace(TRIM_LINES, eolTo)
    if (ss.length > maxEolChars) ss = ss.slice(0, maxEolChars)
    return ss
  }
}
