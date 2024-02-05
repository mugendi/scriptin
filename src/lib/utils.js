/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
export function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export class LocalStorage {
  get(key) {
    // return null
    let value = null;
    try {
      if (!window.localStorage) return null;
      const resp = localStorage.getItem(key);
      // console.log({resp});
      if (resp) {
        value = JSON.parse(resp);
      }
    } catch (error) {
      console.error(error);
      value = null;
    }

    return value;
  }

  set(key, data) {
    console.log({ key, data });
    if (!window.localStorage) return null;
    return localStorage.setItem(key, data ? JSON.stringify(data) : null);
  }

  remove(key) {
    if (!window.localStorage) return null;
    return localStorage.removeItem(key);
  }

  clearAll() {
    if (!window.localStorage) return null;
    return localStorage.clear();
  }
}