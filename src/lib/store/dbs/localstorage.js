// wrapper for localstorage to enable domain based storage

export default class LocalStorage {
  constructor(options) {
    this.name = options.name;

    var methods = ['getItem', 'setItem', 'removeItem', 'clear'];

    for (var i in methods) {
      this[methods[i]] = function (methodName) {
        var args = arguments;
        var key = this.__formatKey(args[1]);
        var value = args[2];
        var resp;

        if (value) {
          value = JSON.stringify(value);
        }

        if (value) {
          resp = localStorage[methodName](key, value);
        } else {
          resp = localStorage[methodName](key);
        }

        if (resp) {
          resp = JSON.parse(resp);
        }

        return resp;
      }.bind(this, methods[i]);
    }
  }

  __formatKey(key) {
    return [this.name, key].join(':');
  }
}
