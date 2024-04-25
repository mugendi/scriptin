var ScriptIn = (function () {
  'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
      return !!right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }

  /**
   * Copyright (c) 2023 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  // Ref:https://gist.github.com/Danilovonline/1b87ef2ff1b1e0b19714a8b2e6246856
  function httpRequest(url, method, data, opts, success_callback, failure_callback) {
    var xhr;

    // defaults options
    var defaultOpts = {
      headers: {}
    };
    method = method.toUpperCase();

    // for post/put methods
    if (['POST', 'PUT'].indexOf(method) > -1) {
      defaultOpts.headers['content-type'] = 'application/json';
    }
    opts = Object.assign(defaultOpts, opts);
    var headers = {};
    for (var k in opts.headers) {
      headers[k.toLowerCase()] = opts.headers[k];
    }
    var data2 = [];
    if (typeof data == 'object') {
      // format data
      if (headers['content-type'] == 'application/json') {
        data = JSON.stringify(data);
      } else {
        for (var index in data) {
          if (data.hasOwnProperty(index)) {
            data2[data2.length] = index + '=' + data[index];
          }
        }
        data = data2.join('&');
      }
    }
    if (typeof XMLHttpRequest !== 'undefined') {
      xhr = new XMLHttpRequest();
    } else {
      var versions = ['MSXML2.XmlHttp.5.0', 'MSXML2.XmlHttp.4.0', 'MSXML2.XmlHttp.3.0', 'MSXML2.XmlHttp.2.0', 'Microsoft.XmlHttp'];
      for (var i = 0, len = versions.length; i < len; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          break;
        } catch (e) {}
      } // end for
    }
    var ua = navigator.userAgent.toLowerCase();
    xhr.onreadystatechange = function () {
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
      if (this.readyState === this.HEADERS_RECEIVED) {
        // Get the raw header string
        var headers = xhr.getAllResponseHeaders();
        // Convert the header string into an array
        // of individual headers
        var arr = headers.trim().split(/[\r\n]+/);

        // Create a map of header names to values
        var headerMap = {};
        arr.forEach(function (line) {
          var parts = line.split(': ');
          var header = parts.shift().toLowerCase();
          var value = parts.join(': ');
          headerMap[header] = value;
        });

        // console.log(headerMap['content-type']);

        xhr.headers = headerMap;
      }
    };
    if (ua.indexOf('msie') != -1 && ua.indexOf('opera') == -1 && ua.indexOf('webtv') == -1) {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            // Success!
            success_callback(xhr);
          } else {
            // Error :(
            failure_callback(xhr);
          }
        }
      };
    } else {
      xhr.onload = function (e) {
        if (this.status == 200) {
          // console.log(xhr.data);
          success_callback(xhr);
        } else {
          failure_callback(xhr);
        }
      };
    }
    if (!method) {
      method = 'GET';
    }
    method = method.toUpperCase();

    // console.log({method});

    xhr.open(method, url, true);

    // console.log('TTT', url, opts);

    if (opts.responseType) {
      xhr.responseType = opts.responseType;
    }
    //

    for (var key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }
    xhr.send(data);
  }
  class Ajax {
    constructor({
      methods = ['get', 'post', 'head', 'put', 'post', 'patch', 'delete']
    } = {}) {
      var self = this;
      methods.forEach(function (method) {
        self[method] = function (url, data, opts = {}) {
          return this.__fetch(url, method, data, opts);
        };
      });
    }
    __fetch(url, method, data, opts) {
      // console.log({data});
      return new Promise(function (resolve, reject) {
        httpRequest(url, method, data, opts, function (xhr) {
          // console.log(">>>>", xhr.response==xhr.responseText);
          // console.log(xhr);
          resolve({
            data: xhr.response,
            headers: xhr.headers
          });
        }, reject);
      });
    }
  }
  var ajax = new Ajax();

  /**
   * Copyright (c) 2024 Anthony Mugendi
   * 
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  //source: https://github.com/chrisdavies/eev

  var Eev = (function () {
    var id = 0;
    var splitter = /[\s,]+/g;

    // A relatively generic LinkedList impl
    function LinkedList(linkConstructor) {
      this.head = new RunnableLink();
      this.tail = new RunnableLink(this.head);
      this.head.next = this.tail;
      this.linkConstructor = linkConstructor;
      this.reg = {};
    }
    LinkedList.prototype = {
      insert: function (data) {
        var link = new RunnableLink(this.tail.prev, this.tail, data);
        link.next.prev = link.prev.next = link;
        return link;
      },
      remove: function (link) {
        link.prev.next = link.next;
        link.next.prev = link.prev;
      }
    };

    // A link in the linked list which allows
    // for efficient execution of the callbacks
    function RunnableLink(prev, next, fn) {
      this.prev = prev;
      this.next = next;
      this.fn = fn || noop;
    }
    RunnableLink.prototype.run = function (data) {
      this.fn(data);
      this.next && this.next.run(data);
    };
    function noop() {}
    function Eev() {
      this.events = {};
    }
    Eev.prototype = {
      constructor: Eev,
      on: function (names, fn, ctx) {
        var me = this;
        fn = fn.bind(ctx || null);
        // console.log('ctx', ctx);

        names.split(splitter).forEach(function (name) {
          var list = me.events[name] || (me.events[name] = new LinkedList());
          var eev = fn._eev || (fn._eev = ++id);
          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      },
      off: function (names, fn) {
        var me = this;
        fn && names.split(splitter).forEach(function (name) {
          var list = me.events[name];
          if (!list) {
            return;
          }
          var link = list.reg[fn._eev];
          list.reg[fn._eev] = undefined;
          list && link && list.remove(link);
        });
      },
      emit: function (name, data) {
        var evt = this.events[name];
        evt && evt.head.run(data);
      }
    };
    return Eev;
  })();

  class DbStorage {
    constructor(options) {
      this.name = options.name;
    }
    getItem(key) {
      var _this = this;
      return _asyncToGenerator(function* () {
        var store = yield _this.__getStore();
        return awaitRequest(store.get(key), 'Failed to get item');
      })();
    }
    setItem(key, value) {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var store = yield _this2.__getStore();
        return awaitRequest(store.put(value, key), 'Failed to set item');
      })();
    }
    removeItem(key) {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var store = yield _this3.__getStore();
        return awaitRequest(store.delete(key), 'Failed to remove item');
      })();
    }
    clear() {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        var store = yield _this4.__getStore();
        return awaitRequest(store.clear(), 'Failed to clear store');
      })();
    }
    __getStore() {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        var db = yield _this5.__initDb();
        return db.transaction('store', 'readwrite').objectStore('store');
      })();
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

  // wrapper for localstorage to enable domain based storage

  class LocalStorage {
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

  /**
   * Copyright (c) 2024 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  class Store {
    constructor(options = {}) {
      this.options = Object.assign({
        name: window.location.host,
        debug: false
      }, options);
      // initialize store
      return this.initStore();
    }
    initStore() {
      var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
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

  function toDate(argument) {
    var argStr = Object.prototype.toString.call(argument);

    // Clone the date
    if (_instanceof(argument, Date) || typeof argument === 'object' && argStr === '[object Date]') {
      // Prevent the date to lose the milliseconds when passed to new Date() in IE10
      return new argument.constructor(+argument);
    } else if (typeof argument === 'number' || argStr === '[object Number]' || typeof argument === 'string' || argStr === '[object String]') {
      // TODO: Can we get rid of as?
      return new Date(argument);
    } else {
      // TODO: Can we get rid of as?
      return new Date(NaN);
    }
  }
  function constructFrom(date, value) {
    if (_instanceof(date, Date)) {
      return new date.constructor(value);
    } else {
      return new Date(value);
    }
  }
  function addMilliseconds(date, amount) {
    var timestamp = +toDate(date);
    return constructFrom(date, timestamp + amount);
  }
  function addSeconds(date, amount) {
    return addMilliseconds(date, amount * 1000);
  }
  function isBefore(date, dateToCompare) {
    var _date = toDate(date);
    var _dateToCompare = toDate(dateToCompare);
    return +_date < +_dateToCompare;
  }

  /**
   * Copyright (c) 2024 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  function getHeaderType(headers) {
    // console.log(script);
    var contentType = (headers['content-type'] || '').toLowerCase();
    var arr = contentType.split(';')[0].split('/');
    return {
      category: arr[0] || "?",
      type: arr[1] || arr[0] || "?"
    };
  }
  function hasExpiredHeader(headers, dateFetched) {
    // if last modified header
    if (headers['last-modified'] && isBefore(dateFetched, new Date(headers['last-modified']))) {
      return true;
    }

    // use expires headers
    if (headers['expires'] && isBefore(new Date(headers['expires']), dateFetched)) ;

    //otherwise check using max age
    if (headers['cache-control']) {
      var arr = headers['cache-control'].split(',').map(function (v) {
        return v.split('=');
      }).filter(function (arr) {
        return arr.length == 2 && arr[0].indexOf('age') > -1;
      }).map(function (a) {
        return parseInt(a[1]);
      });
      var maxAge = arr[0];
      var expiresOn = addSeconds(dateFetched, maxAge);
      if (isBefore(expiresOn, dateFetched)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Copyright (c) 2023 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  function arrify(v) {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
  }
  function toDataURI(content) {
    // ony work with blobs
    if (_instanceof(content, Blob) == false) return Promise.resolve(content);
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(content);
    });
  }
  function injectScript(script) {
    var tagEl;

    // https://sourcemaps.info/spec.html
    var sourceURL = `//# sourceURL=${script.url};`;
    var content = script.content.data;
    var headEl = document.querySelector('head') || document.querySelector('body') || document.querySelector('html');
    if (script.content.type == 'javascript') {
      tagEl = document.createElement('script');
      tagEl.setAttribute('type', 'text/javascript');
      // add source url
      content += `\n${sourceURL}`;
    } else if (script.content.type == 'css') {
      tagEl = document.createElement('style');
      tagEl.setAttribute('type', 'text/css');
      tagEl.setAttribute('rel', 'stylesheet');
      // add source url
      content += `\n/* ${sourceURL} */`;
    }
    tagEl.setAttribute('data-url', script.url);
    tagEl.textContent = content;
    headEl.appendChild(tagEl);

    // return
    return tagEl;
  }
  function hash(s) {
    s = String(s);
    var h = 0,
      l = s.length,
      i = 0;
    if (l > 0) while (i < l) h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return 'h' + String(h).replace('-', 'Z');
  }
  function merge(target, source) {
    // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
    for (var key of Object.keys(source)) {
      if (_instanceof(source[key], Object)) Object.assign(source[key], merge(target[key] || {}, source[key]));
    }

    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    return target;
  }
  function getHost() {
    // obtain plugin path from the script element
    var src;
    var path = '/scriptin.js';
    if (document.currentScript) {
      src = document.currentScript.src;
    } else {
      var sel = document.querySelector('script[src$="' + path + '"]');
      if (sel) {
        src = sel.src;
      }
    }
    return src.replace(path, '');
  }
  function isClass(val) {
    if (!val) return false;
    var propertyNames = Object.getOwnPropertyNames(val);
    return propertyNames.includes('prototype') && !propertyNames.includes('arguments');
  }
  function isAbsoluteURL(url) {
    return /^(?:[a-z+]+:)?\/\//.test(url);
  }

  /**
   * Copyright (c) 2024 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  const pluginsOrder = ['IsLoading', 'Details', 'AutoResource'];

  /**
   * Copyright (c) 2023 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */


  // these characters are used in place of +ve/affirmative or the opposite statements and words
  // This is done on purpose in a bid to make this script as tiny as possible
  // For Example, we save the cache status for scripts as { "enabled": "✓", "status": "✖"}
  // This translates to : "cache enabled" but current status of data is that it "was not" read from cache.
  // One of the key goals is to make Scriptin as small as possible. A resource loader cannot be the first thing taking forever to load
  var Y = "✓";
  var N = "✖";
  var scriptHost = getHost();
  class Scriptin {
    constructor(options = {}) {
      this.scriptHost = scriptHost;
      this.options = merge({
        ttl: 0,
        injectToHead: true,
        debug: false,
        ignoreURLParams: true
      }, options);
      this.events = new Eev();
      this.ajax = ajax;
      this.store = new Store();
      this.Scriptin = this;
      this.__init();
      this.loadedPlugins = {};
    }
    __init() {
      this.__listener();
      this.__init_plugins();
    }
    on(evs, fn) {
      evs = arrify(evs);
      for (var i in evs) {
        this.events.on(evs[i], fn);
      }
    }
    load(scripts, options) {
      var _this = this;
      return _asyncToGenerator(function* () {
        try {
          var self = _this;
          // console.log(12, { scripts });
          // 1. ensure is array
          scripts = arrify(scripts);
          // 2. Filter & format scripts
          var script;
          var promises = [];

          // load each script
          for (var i in scripts) {
            script = scripts[i];
            // if null, skip and continue
            if (!!script === false) continue;
            // only use objects
            if (typeof script == "string") script = {
              url: script
            };

            // make script key
            var urlKeyVal = script.url;
            if (_this.options.ignoreURLParams) {
              urlKeyVal = urlKeyVal.replace(/[#\?].+$/, "");
            }

            // default cache to true
            script.cache = script.cache === false ? false : true;
            // default ttl to script.ttl or options.ttl or 0
            script.ttl = script.ttl || _this.options.ttl || 0;
            // add meta & key
            script.meta = {
              key: hash(urlKeyVal)
            };

            // 3. Now load script
            var loadedScript = yield _this.__loadScript(script);
            promises.push(loadedScript);
            if (loadedScript) {
              var event = (options === null || options === void 0 ? void 0 : options.event) || "loaded";
              var parent = options === null || options === void 0 ? void 0 : options.parent;
              loadedScript.parent = parent;
              self.events.emit(event, loadedScript);
              self.events.emit(loadedScript.url, loadedScript);
              self.events.emit(loadedScript.content.type, loadedScript);
              self.events.emit(loadedScript.content.category, loadedScript);
            }
          }
          return yield Promise.all(promises).then(function (resp) {
            var obj = {};
            for (var i in resp) {
              obj[resp[i].url] = resp[i];
            }
            return obj;
          });
        } catch (error) {
          var _self$options;
          // Handle all errors

          if (self !== null && self !== void 0 && (_self$options = self.options) !== null && _self$options !== void 0 && _self$options.debug) console.error({
            error: error
          });
          var stack = error.stack || /*old opera*/error.stacktrace;
          var errObj = {
            error: {
              status: error.status || error.message,
              details: error.statusText || stack
            },
            script: script
          };
          self.events.emit("error", errObj);
        }
      })();
    }
    __init_plugins() {
      var _this2 = this;
      return _asyncToGenerator(function* () {
        var self = _this2;
        try {
          self.pluginsLoaded = self.pluginsLoaded || [];

          // load
          self.events.on("plugin-loaded", /*#__PURE__*/function () {
            var _ref = _asyncToGenerator(function* (script) {
              var name = script.url.split("/").pop().replace(/\.js$/, "");
              var cName = "ScriptIn" + name;
              var cls = window[cName];
              var parent = script.parent;
              if (isClass(cls)) {
                // pass all methods of Scriptin class

                let plugin = new cls(merge(self, {
                  pluginName: name,
                  parent: parent
                }));
                if (plugin.dependencies) {
                  var deps = arrify(plugin.dependencies);

                  // do not load existing deps
                  // console.log(deps, self.pluginsLoaded);
                  // load plugin deps
                  yield self.__loadPlugins(deps, name);
                }

                // init
                plugin.init && plugin.init();
              }
            });
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }());

          // order plugins properly
          var pluginsObjKeys = Object.keys(_this2.options.plugins);
          var plugins = pluginsOrder.filter(function (p) {
            return pluginsObjKeys.indexOf(p) > -1;
          });

          // load plugins
          yield _this2.__loadPlugins(plugins);

          // await
        } catch (error) {
          console.error(error);
        }
      })();
    }
    __loadPlugins(plugins, parent) {
      var _this3 = this;
      return _asyncToGenerator(function* () {
        var plugin;

        //
        for (var i in plugins) {
          plugin = plugins[i];
          var url;

          // load plugin from absolute link too
          if (isAbsoluteURL(plugins[i])) {
            url = plugins[i];
          } else {
            url = _this3.scriptHost + "/plugins/" + plugin + ".js";
          }
          if (_this3.pluginsLoaded.indexOf(url) > -1) continue;
          _this3.pluginsLoaded.push(url);
          yield _this3.load(url, {
            event: "plugin-loaded",
            parent: parent
          });
        }
      })();
    }
    __loadScript(script) {
      var _this4 = this;
      return _asyncToGenerator(function* () {
        var self = _this4;
        var now = new Date();
        script.meta.cache = {
          enabled: N
        };

        // if script has test and failing test, return
        if ("test" in script && !!script.test === false) {
          _this4.__log('"' + script.url + '" is skipped as the test failed.');
          return null;
        }

        // if script.cache
        if (script.cache) {
          // show that cache is enabled
          script.meta.cache.enabled = Y;
          script.meta.cache.status = N;

          // this.__log(script.url, 'is cached!');
          var cachedScript = yield _this4.store.getItem(script.meta.key);
          if (cachedScript) {
            var cacheStatusDirty = false;
            // now we have a script cached
            // But there are conditions which would make us reject this cache status. These are
            // 1.ttl has not changed
            cacheStatusDirty = script.ttl !== cachedScript.ttl;

            // 2. script.returnType has changed
            cacheStatusDirty = script.returnType !== cachedScript.returnType;
            if (!cacheStatusDirty) {
              // set cache status to Y
              script.meta.cache.status = Y;
              script = merge(cachedScript, script);
            }
          }
        }

        // if script is cached....
        if (script.meta.cache.status == Y) {
          // Check that cache has not expired using TTL
          if (typeof script.ttl == "number" && script.ttl > 0 && script.meta.fetched) {
            var cacheExpiresAt = addSeconds(script.meta.fetched, script.ttl);
            var hasExpired = isBefore(cacheExpiresAt, now);

            // if script still
            if (hasExpired) {
              // delete cache record
              yield self.store.removeItem(script.meta.key);
              // toggle cached status
              script.meta.cache.status = N;
              // delete content property
              delete script.content;
            }
          }

          // 2. check that script has not been modified
          // We do so by calling the head method on the script and comparing last-modified/maxage headers
          self.__validateCache(script);
        }

        // If not cached...
        if (script.meta.cache.status == N) {
          // We got here, so fetch the script
          // Cache script if script cache is enabled
          var resp = yield self.__fetchScript(script);
          var contentLength = parseFloat(resp.headers["content-length"]) || null;

          // console.log(JSON.stringify(resp.headers,0,4));
          script.content = resp.content;
          script.meta.fetched = now;
          script.meta.size = contentLength;

          // if script can be cached, then cache
          if (script.meta.cache.enabled == Y) {
            self.store.setItem(script.meta.key, script);
          }
        }

        // Inject to header if need be
        if (self.options.injectToHead && (script.content.type == "javascript" || script.content.type == "css")) {
          injectScript(script);
        }

        // return script
        return script;
      })();
    }
    __listener() {
      var self = this;

      // listen for cntrl + R
      function KeyPress(_x2) {
        return _KeyPress.apply(this, arguments);
      }
      function _KeyPress() {
        _KeyPress = _asyncToGenerator(function* (e) {
          // console.log(e);
          // e.preventDefault();

          KeyPress.keys = KeyPress.keys || [];
          KeyPress.intVar = KeyPress.intVar;
          clearTimeout(KeyPress.intVar);
          KeyPress.intVar = setTimeout(function () {
            KeyPress.keys = [];
          }, 1000);
          if (e.ctrlKey && KeyPress.keys.indexOf("CTRL") == -1) {
            KeyPress.keys.push("CTRL");
          }
          if (e.code) {
            KeyPress.keys.push(e.code);
          }

          // console.log(KeyPress.keys);

          if (KeyPress.keys.indexOf("KeyR") > -1 && KeyPress.keys.indexOf("CTRL") > -1) {
            e.preventDefault();
            yield self.store.clear();
            window.location.reload();
          }
        });
        return _KeyPress.apply(this, arguments);
      }
      document.addEventListener("keydown", KeyPress);

      // Listen for dirty state
      var intVar;
      this.events.on("stateIsDirty", function () {
        //  prevent multiple reloads
        clearTimeout(intVar);
        intVar = setTimeout(function () {
          window.location.reload();
        }, 1000);
      });
    }
    __validateCache(script) {
      var _this5 = this;
      return _asyncToGenerator(function* () {
        var self = _this5;
        // console.log(JSON.stringify(script, 0, 4));
        // 1. Make head request
        var resp = yield ajax.head(script.url);
        var hasExpired = hasExpiredHeader(resp.headers, script.meta.fetched);
        if (hasExpired) {
          self.__log('"' + script.url + '" has expired or been modified. Cache will be invalidated and server reloaded.');

          // emit
          self.events.emit("stateIsDirty", true);

          // delete from cache
          yield self.store.removeItem(script.meta.key);
        }
      })();
    }
    __fetchScript(script) {
      var _this6 = this;
      return _asyncToGenerator(function* () {
        // ajax fetch

        _this6.__log("fetching ", script.url);
        // 1. if returnType == 'dataURI' then we want to set  responseType = 'blob';
        var responseType = null;
        var isDataURI = script.returnType === "dataURI";
        if (isDataURI) {
          responseType = "blob";
        }

        // 2.make ajax Get request
        var resp = yield ajax.get(script.url, {}, {
          responseType: responseType
        });

        // get/make data URI
        if (isDataURI) {
          var dataURL = yield toDataURI(resp.data);
          resp = merge(resp, {
            data: dataURL
          });
        }

        // get content type based on headers
        var typeObj = getHeaderType(resp.headers);
        var contentData = resp.data;

        // if json type, then attempt to parse
        if (typeObj.type == "json") {
          try {
            contentData = JSON.parse(contentData);
          } catch (error) {
            console.error(error);
          }
        }
        contentData = merge({
          data: contentData
        }, typeObj);

        // content object and headers
        return {
          content: contentData,
          headers: resp.headers
        };
      })();
    }
    __log() {
      if (this.options.debug) console.log.apply(null, arguments);
    }
  }

  return Scriptin;

})();
//# sourceMappingURL=scriptin.js.map


/**
 * This code is added by the rollup-plugin-reloadsite plugin
 * Naturally, this plugin is disabled as soon as you stop watching your source files via the -w flag
 * process.env.ROLLUP_WATCH is used to automatically mute the plugin and this code, as well as the actual ReloadSite server will disappear
 * However, it is better to be explicit in your code and only load the rollup-plugin-reloadsite  plugin in development mode
 *
 * Note: If you have run multiple sources, then you might find this code in multiple files.
 * However, it's effect is limited to only one time as the if condition below should stop all other instances from running
 */

// see if script tag exists
(function () {
  let scriptExists = document.querySelector('script#ReloadSite');

  if (!scriptExists) {
    // get document body
    let body = document.querySelector('body,html');

    if (body) {
      // create tag
      let tag = document.createElement('script');
      tag.src = 'http://127.0.0.1:35729/reloadsite.js';
      tag.id = 'ReloadSite';
      body.append(tag);
    } else {
      console.warn('HTML document has no body or html tag!');
    }
  }
})();
