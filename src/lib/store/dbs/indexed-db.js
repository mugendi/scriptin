export default class DbStorage {
  constructor(options) {
    this.name = options.name;
  }

  async getItem(key) {
    var store = await this.__getStore();
    return awaitRequest(store.get(key), 'Failed to get item');
  }

  async setItem(key, value) {
    var store = await this.__getStore();
    return awaitRequest(store.put(value, key), 'Failed to set item');
  }

  async removeItem(key) {
    var store = await this.__getStore();
    return awaitRequest(store.delete(key), 'Failed to remove item');
  }

  async clear() {
    var store = await this.__getStore();
    return awaitRequest(store.clear(), 'Failed to clear store');
  }

  async __getStore() {
    var db = await this.__initDb();
    return db.transaction('store', 'readwrite').objectStore('store');
  }

  __initDb() {
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
