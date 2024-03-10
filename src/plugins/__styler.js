/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import styleToCss from '../lib/obj-to-css/index.js';

export default class Plugin {
  constructor(ctx) {
    // inherit Scriptin (this.Scriptin) context which we will need
    Object.assign(this, ctx);
    // initialize
    ctx.__getPluginStyles = this.__getPluginStyles;
    ctx.injectStyles = this.injectStyles;
  }

  __getPluginStyles(pluginName, css = '') {
    var customStyles = this.options?.plugins[pluginName]?.styles || null;

    var styleString = '';

    if (customStyles) {
      styleString = styleToCss(customStyles);
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
