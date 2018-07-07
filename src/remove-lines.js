
import acorn from 'acorn'

const EOL_TYPES = { unix: '\n', mac: '\r', win: '\r\n' }

// Matches empty lines at the start of the buffer
const FIRST_EMPTY_LINES = /^\s*[\r\n]/
// Searches lines and captures its line-endings (of any type).
const EACH_LINE = /.*(?:\r\n?|\n)/g
// Matches spaces after the last line-ending
const TRAILING_SPACES = /[^\S\r\n]+$/

export default function removeLines(magicStr, code, file, options) {

  // Local regex that matches one or more line endings and its leading spaces
  const NEXT_LINES = /\s*[\r\n]/g

  const eolTo   = EOL_TYPES[options.normalizeEols]
  const empties = options.maxEmptyLines
  const maxEolCharsAtStart = empties < 0 ? Infinity : empties ? empties * eolTo.length : 0
  // middle lines count one more
  const maxEolChars = maxEolCharsAtStart + eolTo.length

  let changes = false
  let pos = 0

  // Helpers
  // -------

  /**
   * Replaces a string block with a new one through MagicString.
   * @param {string} str Original block
   * @param {number} start Offset of the block
   * @param {string} rep New block
   */
  const replaceBlock = (str, start, rep) => {
    if (str !== rep) {
      magicStr.overwrite(start, start + str.length, rep)
      changes = true
    }
  }

  /**
   * Normalizes and compacts a block of blank characters to convert it into a
   * block of line-endings that do not exceed the maximum number defined by the
   * user.
   * @param {string} str Block of blank characters to search on
   * @param {number} max Maximum number of *characters* for the empty lines
   */
  const limitLines = (str, max) => {
    let ss = str.replace(EACH_LINE, eolTo)
    if (ss.length > max) {
      ss = ss.slice(0, max)
    }
    return ss
  }

  /**
   * Normalizes and compacts the region of the buffer bounded by `start` and `end`.
   * @param {number} start Offset of the start of the region
   * @param {number} end Ending of the region
   * @param {boolean} atStart We are at the beginning of the buffer?
   * @param {boolean} atEnd At the end of the buffer?
   */
  const squashRegion = (start, end, atStart, atEnd) => {
    const region = magicStr.slice(start, end)
    let block
    let match

    // first empty lines
    if (atStart && (match = region.match(FIRST_EMPTY_LINES))) {
      block = match[0]
      replaceBlock(block, start, limitLines(block, maxEolCharsAtStart))

      // Set lastIndex to the start of the first non-empty line in this region
      NEXT_LINES.lastIndex = block.length
    } else {
      // Reset lastIndex to the start of this region
      NEXT_LINES.lastIndex = 0
    }

    // Compact intermediate lines, if `maxEmptyLines` is zero all blank lines
    // are removed. If it is -1 the spaces are removed, keeping the EOLs.
    if (empties) {
      // maxEmptyLines -1 or > 0
      while ((match = NEXT_LINES.exec(region))) {
        block = match[0]
        replaceBlock(block, start + match.index, limitLines(block, maxEolChars))
      }
    } else {
      // removes all the empty lines
      while ((match = NEXT_LINES.exec(region))) {
        replaceBlock(match[0], start + match.index, eolTo)
      }
    }

    // Cut the spaces after the final EOL
    if (atEnd && (match = TRAILING_SPACES.exec(region))) {
      replaceBlock(match[0], start + match.index, '')
    }
  }

  const onToken = ({ start, end, type }) => {
    if (pos !== start) {
      squashRegion(pos, start, pos === 0, type === acorn.tokTypes.eof)
    }
    pos = end
  }

  // Lines remotion
  // --------------

  acorn.parse(code, Object.assign(
    {},
    options.acornOptions,
    { onToken }
  ))

  return changes
}
