/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

'use strict';

import DbStorage from './dbs/indexed-db.js';
import LocalStorage from './dbs/localstorage.js';


class Store {
  constructor(options = {}) {
    this.options = Object.assign(
      { name: window.location.host, debug: false },
      options
    );
    // initialize store
    return this.initStore();
  }

  initStore() {
    var indexedDB =
      window.indexedDB ||
      window.webkitIndexedDB ||
      window.mozIndexedDB ||
      window.msIndexedDB;

    var db;

    if (indexedDB) {
      db = new DbStorage(this.options);
      db.dbType = 'indexedDB';
    } else if (window.localStorage) {
      db = new LocalStorage(this.options);
      db.dbType = 'localStorage';
    }

    if (this.options.debug) {
      console.log(`Database Used: `, db.dbType);
    }

    return db;
  }
}

export default Store;
