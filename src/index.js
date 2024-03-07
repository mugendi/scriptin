/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

"use strict";

// Reading this code? NOTE:
// 1. This project seeks to produce the tiniest possible build (<10kb) and so a lot of corners have been cut to do so
// 2. This project alo tries to be compatible with as many browsers as possible. As such:
//    - Fancy stuff like async/await have been avoided and plain old Promise/Then/Catch pattern used\
//    - var is also used exclusively in place of let, const commands
//    - I know I could have used polyfills and other methods to load browser-specific builds.
//      But that's a level of complexity in use of the library I chose not to add.
// So in case you find the code not pretty and call-back hellish, understand

import ajax from "./lib/ajax.js";
import Eev from "./lib/events.js";
import Store from "./lib/store/index.js";
import { addSeconds, isBefore } from "./lib/utils/dateFns.js";
import { getHeaderType, hasExpiredHeader } from "./lib/utils/headers.js";
import { arrify, hash, injectScript, toDataURI } from "./lib/utils/general.js";

var merge = Object.assign;

// these characters are used in place of +ve/affirmative or the opposite statements and words
// This is done on purpose in a bid to make this script as tiny as possible
// For Example, we save the cache status for scripts as { "enabled": "✓", "status": "✖"}
// This translates to : "cache enabled" but current status of data is that it "was not" read from cache.
// One of the key goals is to make Scriptin as small as possible. A resource loader cannot be the first thing taking forever to load
var Y = "✓";
var N = "✖";

class Scriptin {
  constructor(options = {}) {
    this.options = merge(
      { ttl: 0, injectToHead: true, debug: false, ignoreURLParams: true },
      options,
    );

    this.events = new Eev();
    this.ajax = ajax;
    this.store = new Store();

    this.__listener();
  }

  on(evs, fn) {
    evs = arrify(evs);
    for (var i in evs) {
      this.events.on(evs[i], fn);
    }
  }

  load(scripts) {
    var self = this;
    // console.log(12, { scripts });
    // 1. ensure is array
    scripts = arrify(scripts);
    // 2. Filter & format scripts
    var script;

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

      // add meta & key
      script.meta = { key: hash(urlKeyVal) };

      // 3. Now load script
      this.__loadScript(script).then(function (script) {
        // done loading script, emit events as necessary

        if (!script) return;

        self.events.emit("loaded", script);
        self.events.emit(script.url, script);
        self.events.emit(script.content.type, script);
        self.events.emit(script.content.category, script);
      });
    }
  }

  __loadScript(script) {
    var self = this;
    var now = new Date();

    // console.log(script);
    // if script has test and failing test, return
    if ("test" in script && !!script.test === false) {
      this.__log('"' + script.url + '" is skipped as the test failed.');
      return Promise.resolve(null);
    }

    // if script
    return this.__scriptCache(script)
      .then(function (cachedScript) {
        // if script is cached....
        if (cachedScript.meta.cache.status == Y) {
          // 1. check that cache has not expired using TTL
          if (typeof self.options.ttl == "number" && self.options.ttl > 0) {
            var cacheExpiresAt = addSeconds(
              cachedScript.meta.fetched,
              self.options.ttl,
            );
            var hasExpired = isBefore(cacheExpiresAt, now);

            // if script still
            if (hasExpired) {
              // delete cache record
              return self.store
                .removeItem(cachedScript.meta.key)
                .then(function (resp) {
                  // returning null forces us to fectch script
                  return null;
                });
            }
          }

          // 2. check that script has not been modified
          // We do so by calling the head method on the script and comparing last-modified/maxage headers
          self.__validateScriptCache(cachedScript);

          return cachedScript;
        }
      })
      .then(function (cachedScript) {
        // ok script has not been cached.
        // 1. if we have a cached script this fat
        // It means the script is not only cached but the cache is valid
        // So, return immediately
        if (cachedScript) return cachedScript;

        // 2. We got here, so fetch the script
        // Cache script if script cache is enabled
        return self.__fetchScript(script).then(function (resp) {
          // if type is json, the
          // console.log(JSON.stringify(resp, 0, 4));

          script.content = resp.content;
          script.meta.fetched = now;

          // if script can be cached, then cache
          if (script.meta.cache.enabled == Y) {
            self.store.setItem(script.meta.key, script);
          }

          // console.log(resp.headers);
          return script;
        });
      })
      .then(function (script) {
        // console.log(script.url, JSON.stringify(script.meta, 0, 4));
        // console.log(JSON.stringify(script, 0, 4));

        if (
          self.options.injectToHead &&
          (script.content.type == "javascript" || script.content.type == "css")
        ) {
          injectScript(script);
        }

        return script;
      })
      .catch(function (error) {
        if (self.options.debug) console.error({ error });

        var stack = error.stack || /*old opera*/ error.stacktrace;

        var errObj = {
          error: {
            status: error.status || error.message,
            details: error.statusText || stack,
          },
          script: script,
        };

        self.events.emit("error", errObj);
      });
  }

  __listener() {
    let self = this;

    // listen for cntrl + R
    document.onkeydown = function KeyPress(e) {
      // console.log(e);

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
        self.store.clear().then(function () {
          window.location.reload();
        });
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
  __validateScriptCache(script) {
    var self = this;
    // console.log(JSON.stringify(script, 0, 4));
    // 1. Make head request
    return ajax.head(script.url).then(function (resp) {
      var headers = resp.headers;

      var hasExpired = hasExpiredHeader(headers, script.meta.fetched);
      if (hasExpired) {
        self.__log(
          '"' +
            script.url +
            '" has expired or been modified. Cache will be invalidated and server reloaded.',
        );

        // emit
        self.events.emit("stateIsDirty", true);

        // delete from cache
        return self.store.removeItem(script.meta.key);
      }
      // console.log(script.url, hasExpired);
    });
  }

  __fetchScript(script) {
    // ajax fetch
    // console.log(script);

    this.__log("fetching ", script.url);
    // 1. if returnType == 'dataURI' then we want to set  responseType = 'blob';
    var responseType = null;

    if (script.returnType === "dataURI") {
      responseType = "blob";
    }

    // 2.make ajax Get call
    return ajax
      .get(script.url, {}, { responseType: responseType })
      .then(function (resp) {
        // get/make data URI
        if (script.returnType === "dataURI") {
          return toDataURI(resp.data).then(function (dataURL) {
            return merge(resp, { data: dataURL });
          });
        }

        return resp;
      })
      .then(function (resp) {
        var typeObj = {
          type: "?",
          category: "?",
        };

        // get content type based on headers
        typeObj = getHeaderType(resp.headers);

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
      });
  }

  // check expiry
  __expireScriptCache(script) {
    script.meta.expired = false;
    return Promise.resolve(script);
  }

  // load script form cache
  // if none is saved, return the original script
  __scriptCache(script) {
    script.meta.cache = { enabled: N };

    // if script.cache == false
    if (script.cache === false) {
      // this.__log(script.url, 'not cached!');
      return Promise.resolve(script);
    }

    // show that cache is enabled
    script.meta.cache.enabled = Y;
    script.meta.cache.status = N;

    // this.__log(script.url, 'is cached!');
    return this.store.getItem(script.meta.key).then(function (cachedScript) {
      if (cachedScript) {
        // show wer read from cache
        cachedScript.meta.cache.status = Y;
        return cachedScript;
      }

      return script;
    });
  }

  __log() {
    if (this.options.debug) console.log.apply(null, arguments);
  }
}

export default Scriptin;
