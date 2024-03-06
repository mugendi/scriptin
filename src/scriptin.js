/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

"use strict";

import { arrify } from "./lib/utils.js";
import { loadScript } from "./lib/load.js";
import ajax from "./lib/ajax.js";
import { get, set, del, clear } from "./lib/store/index.js";
import Eev from "./lib/events.js";

var events = new Eev();

var Scriptin = {
  __contentObj: {},
  reloadBrowser: false,
  events: events,
  load: function (scripts, options = {}) {
    let self = this;
    this.options = options;

    //
    options = Object.assign(
      { injectToHead: true, ttl: 0, debug: false },
      options,
    );

    // console.log(options);
    scripts = arrify(scripts);
    // filter those with none true tests
    var s;
    var promises = [];

    for (var i in scripts) {
      s = scripts[i];

      // if not value or test fails, continue
      if (!!s === false) continue;
      if (typeof s == "object" && "test" in s && !!s.test === false) continue;

      // only use objects
      if (typeof s == "string") s = { url: s };

      // console.log(s);

      let p = loadScript
        .bind(this)(s, options)
        .then(function (resp) {
          // console.log(resp);
          if (resp.status == "ok") {
            events.emit("loaded", resp.script);
            events.emit(resp.script.url, resp.script);
            events.emit(resp.script.contentType, resp.script);
            events.emit(resp.script.contentCategory, resp.script);
          } else if (resp.status == "error") {
            events.emit("error", {
              error: resp.error,
              script: resp.script,
            });
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      promises.push(p);
    }

    // when all is done
    Promise.allSettled(promises)
      .then((resp) => {
        // see if we need to reload browser
        if (self.reloadBrowser) {
          options.debug && console.log("Reloading browser");
          window.location.reload();
        }
      })
      .catch(console.error);
  },

  on(evs, fn) {
    evs = arrify(evs);
    for (var i in evs) {
      events.on(evs[i], fn);
    }
  },
  data(url) {
    if (url in this.__contentObj === false) return null;
    return this.__contentObj[url];
  },

  store: {
    get: get,
    set: set,
    del: del,
    clear: clear,
  },
  ajax: ajax,

  loaded() {},
};

if (window && !!window.open) {
  // expose via window for browser use
  // window.store = store;
  // window.ajax = ajax;
  window.Scriptin = Scriptin;
}

// catch cntrl + R
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
    clear().then(function () {
      window.location.reload();
    });
  }
};
