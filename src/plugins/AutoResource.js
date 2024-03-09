/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default class Plugin {
  constructor(ctx) {
    // inherit Scriptin (this.Scriptin) context which we will need
    Object.assign(this, ctx);
    // initialize
    this.init();
  }

  init() {
    // load resources
    this.loadResources();
  }

  async loadResources() {
    // select all elements
    var els = Object.values(document.querySelectorAll('[data-scriptin]'));

    // loop through and handle each element
    for (var i in els) {
      var el = els[i];
      try {
        this.loadElement(el);
      } catch (error) {
        console.error(error);
      }
    }
  }

  loadElement(el) {
    var self = this;
    // only supported tags
    // if not, an error is thrown
    this.isSupportedTag(el);

    // get dataset
    var data = el.dataset;
    // get url
    var url = data.scriptin;

    // make script data for our call
    var script = { url };
    // merge all other data attributes other than scriptin
    for (var j in data) {
      if (j == 'scriptin') continue;
      script[j] = data[j] || true;
    }

    // set returnType
    script.returnType = script.returnType || 'dataURI';

    // only deal with dataURI's
    if (script.returnType !== 'dataURI') {
      throw (
        'Remove [data-return-type] or set it to "dataURI" from: ' +
        this.printEl(el)
      );
    }

    // Listen for load event
    this.Scriptin.events.on(
      url,
      function (script) {
        // log
        // self.Scriptin.__log( el.dataset.scriptin, 'Ready');
        if (script.content.data instanceof Blob) {
          self.options.debug && console.error('Unexpected Blob Data Format. ');
        } else {
          this.el.setAttribute('src', script.content.data);
          el.classList.remove('scriptin-loading');

          if (self.hideLoader && typeof self.hideLoader == 'function') {
            self.hideLoader(el);
          }
        }
      },
      { el }
    );

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
    throw (
      '<' +
      el.tagName.toLowerCase() +
      '> elements not a supported. Use one of ' +
      allowedTags.map((e) => '<' + e + '>').join(', ')
    );
  }
}
