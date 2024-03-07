
export default class DbStorage {
  constructor(options) {
    this.name = options.name;
  }

  getItem(key) {
    return this.__getStore().then((store) => {
      return awaitRequest(store.get(key), 'Failed to get item');
    });
  }

  setItem(key, value) {
    return this.__getStore().then((store) => {
      return awaitRequest(store.put(value, key), 'Failed to set item');
    });
  }

  removeItem(key) {
    return this.__getStore().then((store) => {
      return awaitRequest(store.delete(key), 'Failed to remove item');
    });
  }

  clear() {
    return this.__getStore().then((store) => {
      return awaitRequest(store.clear(), 'Failed to clear store');
    });
  }

  __getStore() {
    return this.__getOrCreateDb().then((db) => {
      return db.transaction('store', 'readwrite').objectStore('store');
    });
  }

  __getOrCreateDb() {
    if (this.db === undefined) {
      this.db = this.__openDb();
    }
    return this.db;
  }

  __openDb() {
    var request = indexedDB.open(this.name, 1);

    request.addEventListener('upgradeneeded', function () {
      // e.oldVersion
      // e.newVersion
      var db = request.result;
      db.createObjectStore('store');
    });

    return awaitRequest(request, 'Failed to open IndexedDB');
  }
}


function awaitRequest(request, errorMessage) {
  return new Promise(function (resolve, reject) {
    request.addEventListener('success', function () {
      resolve(request.result);
    });
    request.addEventListener('error', function () {
      reject(errorMessage);
    });
  });
}
