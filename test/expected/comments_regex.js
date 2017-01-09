var __TEST = 1
function preproc (code) {
  return code
}
function postproc (code) {
  return code
}
/*@preserve
  main
*/
export default function jspp (options = {}) {
  var filter = function (id) {
    return id || __TEST ? __TEST : true
  }
  return {
    name: 'jspp',
    run: function (code, id) {
      if (typeof code != 'string') {
        code = '__CODE'
      }
      if (!filter(id)) {
        return null
      }
      return postproc(preproc(code, options))
    }
  }
}
