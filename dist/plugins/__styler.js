var ScriptIn__styler = (function () {
  'use strict';

  /**
   * @callback Parser
   * @param {string} target - The target text for the transformation
   * @returns {string}
   */

  /**
   * 
   * @param {string | RegExp} matcher - A regular expression or string to use to match against
   * @param {string} replacer A string to use to replace the matcher
   * @returns {Parser}
   */

  function createParser(matcher, replacer) {
    const regex = RegExp(matcher, 'g');
    return function (string) {
      // * throw an error if not a string
      if (typeof string !== 'string') {
        throw new TypeError(`expected an argument of type string, but got ${typeof string}`);
      }

      // * if no match between string and matcher
      if (!string.match(regex)) {
        return string;
      }

      // * executes the replacer function for each match
      // ? replacer can take any arguments valid for String.prototype.replace
      return string.replace(regex, replacer);
    };
  }

  /**
   * @type import('./createParser').Parser
   */
  const camelToKebab = createParser(/[A-Z]/, function (match) {
    return `-${match.toLowerCase()}`;
  });

  function toCss(json) {
    var output = '';
    for (let selector in json) {
      if (json.hasOwnProperty(selector)) {
        output += selector + ' {\n';
        for (let style in json[selector]) {
          if (json[selector].hasOwnProperty(style)) {
            output += camelToKebab(style) + ': ' + json[selector][style] + ';\n';
          }
        }
        output += '}\n';
      }
    }
    return output;
  }

  /**
   * Copyright (c) 2024 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  class Plugin {
    constructor(ctx) {
      // inherit Scriptin (this.Scriptin) context which we will need
      Object.assign(this, ctx);
      // initialize
      ctx.__getPluginStyles = this.__getPluginStyles;
      ctx.injectStyles = this.injectStyles;
    }
    __getPluginStyles(pluginName, css = '') {
      var _this$options;
      var customStyles = ((_this$options = this.options) === null || _this$options === void 0 || (_this$options = _this$options.plugins[pluginName]) === null || _this$options === void 0 ? void 0 : _this$options.styles) || null;
      var styleString = '';
      if (customStyles) {
        styleString = toCss(customStyles);
      }
      return css + '\n\n' + styleString;
    }
    injectStyles(css = '') {
      // // if(this.Scriptin.__getPluginStyles)
      var styleString = this.__getPluginStyles(this.parent, css);

      // Inject loading css to head
      var head = document.head || document.body;
      var style = document.createElement('style');
      style.textContent = styleString;
      head.appendChild(style);
      return styleString;
    }
  }

  return Plugin;

})();
//# sourceMappingURL=__styler.js.map
