var ScriptInIsLoading = (function () {
  'use strict';

  var css = "/**\n * Copyright (c) 2024 Anthony Mugendi\n * \n * This software is released under the MIT License.\n * https://opensource.org/licenses/MIT\n */\n\n\n\n.scriptin-loading, .scriptin-loader {\n  background: rgba(75, 11, 194,.9);\n  min-width: 76px;\n  min-height: 36px;\n  border-radius: 10px;\n  --c:no-repeat radial-gradient(farthest-side,#000 92%,#0000);\n  --s:18px 18px;\n  -webkit-mask:\n    var(--c) left  10% top 50%,\n    var(--c) center,\n    var(--c) right 10% top 50%,\n    linear-gradient(#000 0 0);\n  -webkit-mask-composite:xor;\n          mask-composite:exclude;\n  animation: l1 1.5s infinite;\n}\n\n\n\n@keyframes l1 {\n  0%    {-webkit-mask-size:0    0  ,0    0  ,0    0  ,auto}\n  16.67%{-webkit-mask-size:var(--s),0    0  ,0    0  ,auto}\n  33.33%{-webkit-mask-size:var(--s),var(--s),0    0  ,auto}\n  50%   {-webkit-mask-size:var(--s),var(--s),var(--s),auto}\n  66.67%{-webkit-mask-size:0    0  ,var(--s),var(--s),auto}\n  83.33%{-webkit-mask-size:0    0  ,0    0  ,var(--s),auto}\n  100%  {-webkit-mask-size:0    0  ,0    0  ,0    0  ,auto}\n}\n\n\n\n.scriptin-hidden {\n  display: none !important;\n}\n\n";

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
      ctx.showLoader = this.showLoader.bind(this);
      ctx.hideLoader = this.hideLoader.bind(this);
      this.dependencies = ['__styler', 'AutoResource'];
    }
    init() {
      // Inject loading css to head
      var head = document.head || document.body;
      var style = document.createElement('style');
      style.textContent = css;
      head.appendChild(style);
    }
    showLoader(el) {
      var loaderDiv = document.createElement('div');
      loaderDiv.setAttribute('class', 'scriptin-loader');
      loaderDiv.setAttribute('title', 'Scriptin loading ' + el.dataset.scriptin);
      loaderDiv.setAttribute('data-loader', el.dataset.scriptin);
      loaderDiv.innerHTML = '<div class="loader"></div> ';
      this.copyStyles(el, loaderDiv);
      el.after(loaderDiv);
      el.classList.add('scriptin-hidden');
    }
    hideLoader(el) {
      // get loader
      var loaderDiv = document.querySelector('[data-loader="' + el.dataset.scriptin + '"]');
      // remove
      if (loaderDiv) loaderDiv.remove();
      el.classList.remove('scriptin-hidden');
    }
    copyStyles(el, loaderDiv) {
      var styles = window.getComputedStyle(el);
      var cssText;
      if (styles.cssText !== '') {
        loaderDiv.style.cssText = styles.cssText;
      } else {
        var _this$options;
        cssText = Object.values(styles).reduce(function (css, propertyName) {
          return `${css}${propertyName}:${styles.getPropertyValue(propertyName)};`;
        });
        cssText = cssText + 'min-width: 64px; min-height: 32px;  display: inline-block; margin: 2.5px;';

        // apply custom styles
        var customStyles = ((_this$options = this.options) === null || _this$options === void 0 || (_this$options = _this$options.plugins) === null || _this$options === void 0 || (_this$options = _this$options.IsLoading) === null || _this$options === void 0 ? void 0 : _this$options.styles) || {};
        if (typeof customStyles == 'object') {
          for (var n in customStyles) {
            cssText = cssText + n + ':' + customStyles[n] + ';';
          }
        }
        loaderDiv.style.cssText = cssText;
      }
    }
  }

  return Plugin;

})();
//# sourceMappingURL=IsLoading.js.map
