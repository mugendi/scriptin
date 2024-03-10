/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import css from '../styles/plugins/loader.css';

export default class Plugin {
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
    var loaderDiv = document.querySelector(
      '[data-loader="' + el.dataset.scriptin + '"]'
    );
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
      cssText = Object.values(styles).reduce(
        (css, propertyName) =>
          `${css}${propertyName}:${styles.getPropertyValue(propertyName)};`
      );

      cssText =
        cssText +
        'min-width: 64px; min-height: 32px;  display: inline-block; margin: 2.5px;';

      // apply custom styles
      var customStyles = this.options?.plugins?.IsLoading?.styles || {};
      if (typeof customStyles == 'object') {
        for (var n in customStyles) {
          cssText = cssText + n + ':' + customStyles[n] + ';';
        }
      }

      loaderDiv.style.cssText = cssText;
    }
  }
}
