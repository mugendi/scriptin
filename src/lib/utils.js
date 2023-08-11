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
      if (resp) {
        value = JSON.parse(resp);
      }
    } catch (error) {
      console.error(error);
    }

    return value;
  }

  set(key, data) {
    if (!window.localStorage) return null;
    return localStorage.setItem(key, JSON.stringify(data));
  }

  clearAll() {
    return localStorage().clear();
  }
}

// extend store to for easy expiration management
// this class exists, even th
export class Store {
  constructor(store) {
    this.store = store || new LocalStorage();
  }

  get(key) {
    const data = this.store.get(key);

    if (!data) return null;

    const { expire, value } = data;

    if (expire < Date.now()) {
      this.store.remove(key);
      return null;
    }

    return value;
  }

  set(key, value, expire = null) {
    //format expire
    if (expire && typeof expire === "number") {
      expire = Math.round(expire * 1000 + Date.now());
    } else if (expire && expire instanceof Date) {
      expire = expire.getTime();
    } else if (expire) {
      throw new Error(`Expire must be either a date or int (seconds)`);
    }

    return this.store.set(key, { value, expire }, expire);
  }

  clear() {
    return store.clearAll();
  }
}
