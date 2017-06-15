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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJidW5kbGUtc3JjLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5cbiAgVGVzdGluZyBzb3VyY2VtYXBzXG5cbiovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG5jb25zdCBfX1RFU1QgPSAxXG5cblxuZnVuY3Rpb24gcHJlcHJvYyAoY29kZSkge1xuICByZXR1cm4gY29kZVxufVxuXG5mdW5jdGlvbiBwb3N0cHJvYyAoY29kZSkge1xuICByZXR1cm4gY29kZVxufVxuXG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ganNwcCAob3B0aW9ucyA9IHt9KSB7XG5cbiAgY29uc3QgZmlsdGVyID0gaWQgPT4gaWQgfHwgX19URVNUXG5cbiAgcmV0dXJuIHtcblxuICAgIC8vIG5hbWUgZm9yIGVycm9yc1xuXG4gICAgbmFtZTogJ2pzcHAnLFxuXG4gICAgLy8gY29tbWVudFxuXG4gICAgcnVuKGNvZGUsIGlkKSB7XG4gICAgICBpZiAodHlwZW9mIGNvZGUgIT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29kZSA9ICdfX0NPREUnXG4gICAgICB9XG4gICAgICBpZiAoIWZpbHRlcihpZCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb3N0cHJvYyhwcmVwcm9jKGNvZGUsIG9wdGlvbnMpKVxuICAgIH1cbiAgfVxuXG59XG4iXSwibmFtZXMiOlsiY29uc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFPQUEsTUFBTSxNQUFNLEdBQUcsRUFBQztFQUdoQixTQUFTLE9BQU8sRUFBRSxJQUFJLEVBQUU7SUFDdEIsT0FBTyxJQUFJO0dBQ1o7RUFFRCxTQUFTLFFBQVEsRUFBRSxJQUFJLEVBQUU7SUFDdkIsT0FBTyxJQUFJO0dBQ1o7QUFJRCxFQUFlLFNBQVMsSUFBSSxFQUFFLE9BQVksRUFBRTtxQ0FBUCxHQUFHLEVBQUU7SUFFeENBLElBQU0sTUFBTSxHQUFHLFVBQUEsRUFBRSxFQUFDLFNBQUcsRUFBRSxJQUFJLE1BQU0sSUFBQTtJQUVqQyxPQUFPO01BSUwsSUFBSSxFQUFFLE1BQU07TUFJWixHQUFHLGNBQUEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFO1FBQ1osSUFBSSxPQUFPLElBQUksSUFBSSxRQUFRLEVBQUU7VUFDM0IsSUFBSSxHQUFHLFNBQVE7U0FDaEI7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1VBQ2YsT0FBTyxJQUFJO1NBQ1o7UUFDRCxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ3hDO0tBQ0Y7R0FFRjs7Ozs7Ozs7Ozs7In0=