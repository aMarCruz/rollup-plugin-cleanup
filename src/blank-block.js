/**
 * By using premaked string of spaces, blankBlock is faster than
 * block.replace(/[^ \n]+/, ' ').
 *
 * @const {string}
 * @static
 */
const space150 = new Array(151).join(' ')

/**
 * Replaces all characters in the clock with spaces, except line-feeds.
 *
 * @param   {string} block - The buffer to replace
 * @returns {string}         The replacement block.
 */
export default function blankBlock (block) {
  return block.replace(/[^\n\r]+/g, m => {
    let len = m.length
    let str = space150

    while (str.length < len) str += space150
    return str.slice(0, len)
  })
}
