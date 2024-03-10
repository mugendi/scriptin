/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

"use strict";

import ajax from "./lib/ajax.js";
import Eev from "./lib/events.js";
import Store from "./lib/store/index.js";
import { addSeconds, isBefore } from "./lib/utils/dateFns.js";
import { getHeaderType, hasExpiredHeader } from "./lib/utils/headers.js";
import {
  arrify,
  getHost,
  hash,
  injectScript,
  isAbsoluteURL,
  isClass,
  merge,
  toDataURI,
} from "./lib/utils/general.js";
import { pluginsOrder } from "./lib/settings.js";

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

    this.options = merge(
      { ttl: 0, injectToHead: true, debug: false, ignoreURLParams: true },
      options,
    );

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

  async load(scripts, options) {
    try {
      var self = this;
      // console.log(12, { scripts });
      // 1. ensure is array
      scripts = arrify(scripts);
      // 2. Filter & format scripts
      var script;

      // load each script
      for (var i in scripts) {
        script = scripts[i];
        // if null, skip and continue
        if (!!script === false) continue;
        // only use objects
        if (typeof script == "string") script = { url: script };

        // make script key
        var urlKeyVal = script.url;

        if (this.options.ignoreURLParams) {
          urlKeyVal = urlKeyVal.replace(/[#\?].+$/, "");
        }

        // default cache to true
        script.cache = script.cache === false ? false : true;
        // default ttl to script.ttl or options.ttl or 0
        script.ttl = script.ttl || this.options.ttl || 0;
        // add meta & key
        script.meta = { key: hash(urlKeyVal) };

        // 3. Now load script
        var loadedScript = await this.__loadScript(script);

        if (loadedScript) {
          var event = options?.event || "loaded";
          var parent = options?.parent;

          loadedScript.parent = parent;

          self.events.emit(event, loadedScript);
          self.events.emit(loadedScript.url, loadedScript);
          self.events.emit(loadedScript.content.type, loadedScript);
          self.events.emit(loadedScript.content.category, loadedScript);
        }
      }
    } catch (error) {
      // Handle all errors

      if (self?.options?.debug) console.error({ error });

      var stack = error.stack || /*old opera*/ error.stacktrace;
      var errObj = {
        error: {
          status: error.status || error.message,
          details: error.statusText || stack,
        },
        script: script,
      };

      self.events.emit("error", errObj);
    }
  }

  async __init_plugins() {
    var self = this;
    try {
      self.pluginsLoaded = self.pluginsLoaded || [];

      // load
      self.events.on("plugin-loaded", async function (script) {
        var name = script.url.split("/").pop().replace(/\.js$/, "");
        var cName = "ScriptIn" + name;
        var cls = window[cName];
        var parent = script.parent;

        console.log(name);

        if (isClass(cls)) {
          // pass all methods of Scriptin class

          let plugin = new cls(merge(self, { pluginName: name, parent }));

          if (plugin.dependencies) {
            var deps = arrify(plugin.dependencies);

            // do not load existing deps
            // console.log(deps, self.pluginsLoaded);
            // load plugin deps
            await self.__loadPlugins(deps, name);
          }

          // init
          plugin.init && plugin.init();
        }
      });

      // order plugins properly
      var pluginsObjKeys = Object.keys(this.options.plugins);
      var plugins = pluginsOrder.filter((p) => pluginsObjKeys.indexOf(p) > -1);

      // load plugins
      await this.__loadPlugins(plugins);

      // await
    } catch (error) {
      console.error(error);
    }
  }

  async __loadPlugins(plugins, parent) {
    var plugin;

    //
    for (var i in plugins) {
      plugin = plugins[i];

      var url;

      // load plugin from absolute link too
      if (isAbsoluteURL(plugins[i])) {
        url = plugins[i];
      } else {
        url = this.scriptHost + "/plugins/" + plugin + ".js";
      }

      if (this.pluginsLoaded.indexOf(url) > -1) continue;

      this.pluginsLoaded.push(url);

      await this.load(url, { event: "plugin-loaded", parent });
    }
  }

  async __loadScript(script) {
    var self = this;
    var now = new Date();

    script.meta.cache = { enabled: N };

    // if script has test and failing test, return
    if ("test" in script && !!script.test === false) {
      this.__log('"' + script.url + '" is skipped as the test failed.');
      return null;
    }

    // if script.cache
    if (script.cache) {
      // show that cache is enabled
      script.meta.cache.enabled = Y;
      script.meta.cache.status = N;

      // this.__log(script.url, 'is cached!');
      var cachedScript = await this.store.getItem(script.meta.key);

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
      if (
        typeof script.ttl == "number" &&
        script.ttl > 0 &&
        script.meta.fetched
      ) {
        var cacheExpiresAt = addSeconds(script.meta.fetched, script.ttl);
        var hasExpired = isBefore(cacheExpiresAt, now);

        // if script still
        if (hasExpired) {
          // delete cache record
          await self.store.removeItem(script.meta.key);
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
      var resp = await self.__fetchScript(script);

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
    if (
      self.options.injectToHead &&
      (script.content.type == "javascript" || script.content.type == "css")
    ) {
      injectScript(script);
    }

    // return script
    return script;
  }

  __listener() {
    var self = this;

    // console.log('>>>>');

    // listen for cntrl + R
    document.onkeydown = async function KeyPress(e) {
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

      // console.log(KeyPress.keys );

      if (
        KeyPress.keys.indexOf("KeyR") > -1 &&
        KeyPress.keys.indexOf("CTRL") > -1
      ) {
        e.preventDefault();
        await self.store.clear();
        window.location.reload();
      }
    };

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

  async __validateCache(script) {
    var self = this;
    // console.log(JSON.stringify(script, 0, 4));
    // 1. Make head request
    var resp = await ajax.head(script.url);
    var hasExpired = hasExpiredHeader(resp.headers, script.meta.fetched);

    if (hasExpired) {
      self.__log(
        '"' +
          script.url +
          '" has expired or been modified. Cache will be invalidated and server reloaded.',
      );

      // emit
      self.events.emit("stateIsDirty", true);

      // delete from cache
      await self.store.removeItem(script.meta.key);
    }
  }

  async __fetchScript(script) {
    // ajax fetch

    this.__log("fetching ", script.url);
    // 1. if returnType == 'dataURI' then we want to set  responseType = 'blob';
    var responseType = null;
    var isDataURI = script.returnType === "dataURI";
    if (isDataURI) {
      responseType = "blob";
    }

    // 2.make ajax Get request
    var resp = await ajax.get(script.url, {}, { responseType: responseType });

    // get/make data URI
    if (isDataURI) {
      var dataURL = await toDataURI(resp.data);
      resp = merge(resp, { data: dataURL });
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

    contentData = merge({ data: contentData }, typeObj);

    // content object and headers
    return { content: contentData, headers: resp.headers };
  }

  __log() {
    if (this.options.debug) console.log.apply(null, arguments);
  }
}

export default Scriptin;
