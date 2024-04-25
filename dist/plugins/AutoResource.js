var ScriptInAutoResource = (function () {
  'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
      return !!right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
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
      this.dependencies = ['IsLoading'];
    }
    init() {
      // load resources
      this.loadResources();
    }
    loadResources() {
      var _this = this;
      return _asyncToGenerator(function* () {
        // select all elements
        var els = Object.values(document.querySelectorAll('[data-scriptin]'));

        // loop through and handle each element
        for (var i in els) {
          var el = els[i];
          try {
            _this.loadElement(el);
          } catch (error) {
            console.error(error);
          }
        }
      })();
    }
    loadElement(el) {
      var self = this;
      // only supported tags
      // if not, an error is thrown
      this.isSupportedTag(el);

      // get dataset
      var data = el.dataset;
      // avoid loading twice
      if (data.scriptinLoading) return;

      // get url
      var url = data.scriptin;
      el.setAttribute('data-scriptin-loading', 'true');

      // make script data for our call
      var script = {
        url: url
      };
      // merge all other data attributes other than scriptin
      for (var j in data) {
        if (j == 'scriptin') continue;
        script[j] = data[j] || true;
      }

      // set returnType
      script.returnType = script.returnType || 'dataURI';

      // only deal with dataURI's
      if (script.returnType !== 'dataURI') {
        throw 'Remove [data-return-type] or set it to "dataURI" from: ' + this.printEl(el);
      }

      // Listen for load event
      this.Scriptin.events.on(url, function (script) {
        // log
        // self.Scriptin.__log( el.dataset.scriptin, 'Ready');
        if (_instanceof(script.content.data, Blob)) {
          self.options.debug && console.error('Unexpected Blob Data Format. ');
        } else {
          this.el.setAttribute('src', script.content.data);
          el.classList.remove('scriptin-loading');
          el.removeAttribute('data-scriptin-loading');
          if (self.hideLoader && typeof self.hideLoader == 'function') {
            self.hideLoader(el);
          }
        }
      }, {
        el: el
      });

      // show loading
      el.classList.add('scriptin-loading');
      // if the showLoaderMethod is available
      if (this.showLoader && typeof this.showLoader == 'function') {
        this.showLoader(el);
      }

      // load script
      this.Scriptin.load(script);
    }
    printEl(el) {
      console.log('object');
      var div = document.createElement('div');
      div.appendChild(el);
      return div.innerHTML;
    }
    isSupportedTag(el) {
      var tag = el.tagName.toLowerCase();
      var allowedTags = ['img', 'audio', 'video'];
      if (allowedTags.indexOf(tag) > -1) return true;
      // else throw
      throw '<' + el.tagName.toLowerCase() + '> elements not a supported. Use one of ' + allowedTags.map(function (e) {
        return '<' + e + '>';
      }).join(', ');
    }
  }

  return Plugin;

})();
//# sourceMappingURL=AutoResource.js.map
