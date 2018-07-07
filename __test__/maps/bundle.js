/*
 plugin version 1.0
*/
var myapp = (function () {
  'use strict';

  /* eslint-disable no-undef */
  var __TEST = 1;
  function preproc (code) {
    return code
  }
  function postproc (code) {
    return code
  }
  function jspp (options) {
    if ( options === void 0 ) options = {};
    var filter = function (id) { return id || __TEST; };
    return {
      name: 'jspp',
      run: function run(code, id) {
        if (typeof code != 'string') {
          code = '__CODE';
        }
        if (!filter(id)) {
          return null
        }
        return postproc(preproc(code, options))
      }
    }
  }

  return jspp;

}());
/* follow me on Twitter! @amarcruz */

//# sourceMappingURL=bundle.js.map