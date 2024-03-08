/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import css from '../styles/loader.css';

export default class Plugin {
  constructor(ctx) {
    // inherit Scriptin (this.Scriptin) context which we will need
    Object.assign(this, ctx);
    // initialize
    this.init();
  }

  init() {
    // Inject loading css to head
    let head = document.head || document.body;
    let style = document.createElement('style');
    style.textContent = css;
    head.appendChild(style);
  }
}
