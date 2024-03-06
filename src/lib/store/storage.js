var dbBusy = false;

var storage = function (readyCallback, type) {
  var commons = {
    sequencialActionCallbackWrapper: function (
      values,
      callback,
      finalCallback
    ) {
      var index = 0;
      var length = values.length;

      var _next = function () {
        if (index < length) {
          callback(values[index++]);
        } else {
          finalCallback();
        }
      };

      return {
        next: _next,
      };
    },
    multipleActionCallbackWrapper: function (times, callback) {
      var values = [];

      return {
        countDown: function (value) {
          values.push(value);
          if (values.length === times) {
            callback(values);
          }
        },
      };
    },
  };

  var invokeReadyCallBack = function (database) {
    if (!database) {
      readyCallback();
    } else {
      readyCallback({
        set: function (entity, value, callback) {
          database.set(entity, value, callback);
        },
        get: function (entity, id, callback) {
          database.get(entity, id, callback);
        },
        remove: function (entity, id, callback) {
          database.remove(entity, id, callback);
        },
        removeAll: function (entity, callback) {
          database.removeAll(entity, callback);
        },
        ready: function (callback) {
          database.ready(callback);
        },
        close: database.close,
        type: database.type,
      });
    }
  };

  switch (type) {
    case 'LocalStorage':
      storage.KeyValue(invokeReadyCallBack, commons);
      break;
    case 'SessionStorage':
      storage.KeyValue(invokeReadyCallBack, commons, true);
      break;
    case 'WebSQL':
      storage.WebSQL(invokeReadyCallBack, commons);
      break;
    case 'IndexedDB':
      storage.IndexedDB(invokeReadyCallBack, commons);
      break;
    default:
      //WebSQL
      if (
        window.indexedDB ||
        window.webkitIndexedDB ||
        window.mozIndexedDB ||
        window.msIndexedDB
      ) {
        // console.log('Using IndexedDB');
        storage.IndexedDB(invokeReadyCallBack, commons);
      } else if (window.openDatabase) {
        // console.log('Using WebSQL');
        storage.WebSQL(invokeReadyCallBack, commons);
      } else {
        // console.log('Using LocalStorage');
        //Fallback to localStorage
        storage.KeyValue(invokeReadyCallBack, commons);
      }
      break;
  }
};

// localStorage and sessionStorage wrapper
//      useSession: Indicates if sessionStorage is to be used (default is localStorage)
storage.KeyValue = function (ready, commons, useSession) {
  try {
    var kv = useSession ? sessionStorage : localStorage;
  } catch (e) {
    ready();
    return;
  }

  var _get = function (entity, id, callback) {
    var jsonString = kv.getItem(entity);
    if (jsonString) {
      var stored = JSON.parse(jsonString);
      var length = stored ? stored.length : 0;

      for (var i = 0; i < length; i++) {
        if (stored[i].id === id) {
          callback(stored[i]);
          return;
        }
      }
      callback();
    } else {
      callback();
    }
  };

  var _set = function (entity, value, callback) {
    var stored = JSON.parse(kv.getItem(entity)) || [];
    var updated = false;
    var length = stored.length;

    for (var i = 0; i < length; i++) {
      if (stored[i].id === value.id) {
        updated = true;
        stored[i] = value;
      }
    }
    if (!updated) {
      stored.push(value);
    }

    kv.setItem(entity, JSON.stringify(stored));

    callback();
  };

  var _remove = function (entity, id) {
    var jsonString = kv.getItem(entity);
    if (jsonString) {
      var stored = JSON.parse(jsonString);
      var length = stored.length;

      for (var i = 0; i < length; i++) {
        if (stored[i].id === id) {
          stored.splice(i, 1);
          kv.setItem(entity, JSON.stringify(stored));
          return;
        }
      }
    }
  };

  ready({
    set: _set,
    get: _get,
    remove: function (entity, id, callback) {
      _remove(entity, id);
      callback();
    },
    removeAll: function (entity, callback) {
      kv.removeItem(entity);
      callback();
    },
    close: function () {
      //There is nothing to do
    },
    type: 'KeyValue',
  });
};

storage.WebSQL = function (ready, commons) {
  var db;

  var _createTable = function (name, callback) {
    db.transaction(function (transaction) {
      transaction.executeSql(
        'CREATE TABLE if not exists ' +
          name +
          '(id TEXT NOT NULL, value TEXT, PRIMARY KEY(id));',
        [],
        callback,
        function (transaction, error) {
          console.error(
            'Oops.  Error was ' + error.message + ' (Code ' + error.code + ')',
            error
          );
        }
      );
    });
  };

  var _set = function (entity, value, callback) {
    db.transaction(function (transaction) {
      transaction.executeSql(
        'INSERT OR REPLACE into ' + entity + '(id, value) VALUES ( ?, ? );',
        [value.id, JSON.stringify(value)],
        function () {
          callback();
        },
        function (transaction, error) {
          //No such table
          if (error.code === 5) {
            // console.log('WebSQL: going to create table ' + entity);
            //create the table and try again
            _createTable(entity, function () {
              // console.log('WebSQL: created table ' + entity);
              _set(entity, value, callback);
            });
          } else {
            console.error(
              'WebSQL Error: ' + error.message + ' (Code ' + error.code + ')',
              error
            );
            callback();
          }
        }
      );
    });
  };

  var _get = function (entity, id, callback) {
    db.transaction(function (transaction) {
      transaction.executeSql(
        'select value from ' + entity + ' where id=?;',
        [id],
        function (transaction, results) {
          callback(
            results.rows.length > 0
              ? JSON.parse(results.rows.item(0).value)
              : undefined
          );
        },
        function (transaction, error) {
          //No such table
          if (error.code === 5) {
            callback();
          } else {
            console.error(
              'WebSQL Error: ' + error.message + ' (Code ' + error.code + ')',
              error
            );
            callback();
          }
        }
      );
    });
  };

  var _remove = function (entity, id, callback) {
    db.transaction(function (transaction) {
      transaction.executeSql(
        'delete from ' + entity + ' where id=?',
        [id],
        callback,
        function (transaction, error) {
          console.error(
            'WebSQL Error: ' + error.message + ' (Code ' + error.code + ')',
            error
          );
          callback();
        }
      );
    });
  };

  var _removeAll = function (entity, callback) {
    db.transaction(function (transaction) {
      transaction.executeSql(
        'drop table ' + entity + '',
        [],
        callback,
        //table doesnt exist
        callback
      );
    });
  };

  try {
    if (!window.openDatabase) {
      console.error('SQL Database not supported');
      ready();
    } else {
      var shortName = 'storage.js';
      var version = '1.0';
      var displayName = 'storage.js database';
      var maxSize = 65536; // in bytes
      db = openDatabase(shortName, version, displayName, maxSize);

      ready({
        set: _set,
        get: _get,
        remove: _remove,
        removeAll: _removeAll,
        close: function () {
          //There is nothing to do
        },
        type: 'WebSQL',
      });
    }
  } catch (e) {
    // Error handling code goes here.
    if (e === 2) {
      // Version number mismatch.
      console.log('Invalid database version.');
    } else {
      console.log('Unknown error ' + e + '.');
    }
  }
};

storage.IndexedDB = function (ready, commons) {
  var indexedDB =
    window.indexedDB ||
    window.webkitIndexedDB ||
    window.mozIndexedDB ||
    window.msIndexedDB;
  var db;

  var _createObjectStore = function (entity, callback) {
    db.close();
    var version = db.version + 1;
    var versionRequest = indexedDB.open('storage_js', version);
    versionRequest.onupgradeneeded = function () {
      db = versionRequest.result;
      db.createObjectStore(entity, { keyPath: 'id' });
    };
    versionRequest.onsuccess = callback;
  };

  var _set = function (entity, value, callback) {
    try {
      // console.log(window.Scriptin.options.debug);

      if (!db.objectStoreNames.contains(entity)) {
        if (window.Scriptin.options.debug)
          console.log('IndexedDB: going to create objectStore ' + entity);

        _createObjectStore(entity, function () {
          dbBusy = false;
          if (window.Scriptin.options.debug)
            console.log('IndexedDB: created objectStore ' + entity);
          _set(entity, value, callback);
        });
        return;
      }

      var transaction = db.transaction([entity], 'readwrite');
      var objectStore = transaction.objectStore(entity);
      var request = objectStore.put(value);
      transaction.onerror = function (error) {
        console.trace(
          'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
          error
        );
      };
      request.onsuccess = function () {
        callback();
      };
      request.onerror = function (error) {
        console.trace(
          'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
          error
        );
      };
    } catch (error) {
      //error code 3 and 8 are not found on chrome and canary respectively
      if (error.code !== 3 && error.code !== 8) {
        console.trace(
          'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
          error
        );
        callback();
      } else {
        // console.log('IndexedDB: going to create objectStore ' + entity);
        _createObjectStore(entity, function () {
          _set(entity, value, callback);
        });
      }
    }
  };

  var _get = function (entity, id, callback) {
    try {
      if (!db.objectStoreNames.contains(entity)) {
        // console.log('IndexedDB: missing objectStore ' + entity);
        callback();
      } else {
        var transaction = db.transaction([entity], 'readwrite');
        transaction.onerror = function (error) {
          console.trace(
            'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
            error
          );
        };
        var objectStore = transaction.objectStore(entity);
        objectStore.get(id).onsuccess = function (event) {
          callback(event.target.result);
        };
      }
    } catch (error) {
      console.trace(
        'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
        error
      );
      callback();
    }
  };

  var _remove = function (entity, id, callback) {
    if (!db.objectStoreNames.contains(entity)) {
      // console.log('IndexedDB: missing objectStore ' + entity);
      callback();
    } else {
      var transaction = db.transaction([entity], 'readwrite');
      var objectStore = transaction.objectStore(entity);
      objectStore.delete(id).onsuccess = callback;
    }
  };

  var _removeAll = function (entity, callback) {
    db.close();
    var version = db.version + 1;
    var request = indexedDB.open('storage_js', version);
    request.onupgradeneeded = function () {
      try {
        db = request.result;
        if (db.objectStoreNames.contains(entity)) {
          db.deleteObjectStore(entity);
        }
      } catch (error) {
        //error code 3 and 8 are not found on chrome and canary respectively
        if (error.code !== 3 && error.code !== 8) {
          console.trace(
            'IndexedDB Error: ' + error.message + ' (Code ' + error.code + ')',
            error
          );
        }
      }
    };
    request.onsuccess = callback;
  };

  var _close = function () {
    db.close();
  };

  if (indexedDB) {
    // Now we can open our database
    var request = indexedDB.open('storage_js');
    request.onsuccess = function () {
      db = request.result;
      ready({
        set: _set,
        get: _get,
        remove: _remove,
        removeAll: _removeAll,
        close: _close,
        type: 'IndexedDB',
      });
    };
    request.onerror = function (event) {
      console.log('An error ocurred', event);
      ready();
    };
  } else {
    ready();
  }
};

export default storage;
