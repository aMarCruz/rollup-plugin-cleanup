/*
  Testing sourcemaps
*/
/* eslint-disable no-undef */
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
    // name for errors
    name: 'jspp',
    // comment
    run: function (code, id) {
      if (typeof code != 'string') {
        code = '__CODE'
      }// comment
      if (!filter(id)) {
        return null
      }
      return postproc(preproc(code, options))
    }
  }
  // comment
}
//end
