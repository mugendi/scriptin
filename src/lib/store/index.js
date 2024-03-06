/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

'use strict';

import storage from './storage.js';
var store = null;
var entity = window.location.host;

storage(function (sjs) {
  // set dummy value to ensure store is fully initialized
  sjs.set(entity, { id: '_', value: true }, function (resp) {
    store = sjs;
  });
});

function initStore() {
  return new Promise(function (resolve) {
    if (store) {
      return resolve(store);
    }

    // wait for store to be ready
    var intVar = setInterval(function () {
      if (store) {
        clearInterval(intVar);
        return resolve(store);
      }
    }, 100);
  });
}

export function set(id, val) {
  return new Promise(function (resolve) {
    var value = { id: id, value: val };
    initStore().then(function (store) {
      store.set(entity, value, resolve);
    });
  });
}

export function get(id) {
  return new Promise(function (resolve) {
    initStore().then(function (store) {
      store.get(entity, id, resolve);
    });
  }).then(function (resp) {
    if (resp) return resp.value;
    return null;
  });
}

export function del(id) {
  return new Promise(function (resolve) {
    initStore().then(function (store) {
      store.remove(entity, id, resolve);
    });
  });
}

export function clear(id) {
  return new Promise(function (resolve) {
    initStore().then(function (store) {
      store.removeAll(entity, resolve);
    });
  });
}

// helper script methods
export function storeSet(script) {
  return set(script.url, script);
}

export function storeGet(script) {
  if (script.cache === false) return Promise.resolve(null);
  return get(script.url);
}
