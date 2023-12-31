/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Store, arrify } from "./lib/utils";
import Ajax from "./lib/ajax";

// export ajax
export const ajax = Ajax;

// export Scriptin
export class Scriptin {
  constructor({ ttl = 2592000 /* default 1 month */ } = {}) {
    this.headEl =
      document.querySelector("head") ||
      document.querySelector("body") ||
      document.querySelector("html");

    // set opts
    this.opts = { ttl };
    // start with local storage
    this.store = new Store();
  }

  async __init() {
    try {
      if (window.store) return;

      // load & cache store js
      await this.__ajax_load({
        url: "https://cdn.jsdelivr.net/npm/store@2.0.12/dist/store.legacy.min.js",
        cache: true,
      });

      // now use storejs (window.store)
      this.store = new Store(window.store);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  __head_script(url) {
    return new Promise((resolve, reject) => {
      try {
        const tagEl = document.createElement("script");
        tagEl.setAttribute("src", url);
        this.headEl.appendChild(tagEl);
        tagEl.onload = function () {
          resolve();
        };
      } catch (error) {
        throw error;
      }
    });
  }

  async load(scripts) {
    await this.__init();

    // test clear
    // this.store.clear()

    // ensur array
    scripts = arrify(scripts);

    // map & format each script tag
    scripts = scripts
      .map((o) => {
        // make object if string url was given
        if (typeof o == "string") {
          o = { url: o };
        }

        // add some defaults
        o = Object.assign({ cache: true }, o);

        return o;
      })
      .filter((o) => !o.hasOwnProperty("test") || o.test);

    let tagEl;

    this.reloadPage = false;

    for (let script of scripts) {
      tagEl = await this.__ajax_load(script);
    }

    if (this.reloadPage) {
      window.location.reload();
    }
  }

  clear() {
    return this.store.clear();
  }

  async __ajax_load(script) {
    try {
      // console.log(this.opts.ttl);

      // console.log({script});

      var { content, type, ts } =
        script.cache && this.store
          ? (await this.store.get(script.url)) || {}
          : {};

      // console.log({ url: script.url, c: content?.length, type });

      if (!content) {
        ({ content, type } = await ajax.get(script.url).then((resp) => {
          // console.log("headers", script.url, resp.headers);
          // get type of loaded content
          let contentType = resp.headers["content-type"];
          let type;

          if (contentType.indexOf("/css;") > -1) {
            type = "css";
          } else if (contentType.indexOf("/javascript;") > -1) {
            type = "js";
          }

          return { type, content: resp.data };
        }));

        if (content && type && script.cache) {
          let ts = Date.now();
          let ttl = script.ttl || this.opts.ttl;
          // save content
          this.store.set(script.url, { content, type, ts }, ttl);
        }
      } else {
        let { headers } = await ajax.head(script.url);
        let modified = headers["last-modified"];
        if (modified) {
          let modifiedTs = new Date(modified).getTime();
          // if file has changed
          if (ts < modifiedTs) {
            console.log(script.url, " >> changed");
            this.store.remove(script.url);
            // set  reloadPage as true
            this.reloadPage = true;
          }
        }
      }

      script = Object.assign(script, {
        content,
        type,
      });

      if (!script.type) {
        // throw error
        throw new Error(
          `Content type for '${script.url}' could not be determined. Ensure that the server is serving css and javascript files with appropriate 'content-type' headers.`,
        );
      }

      return await this.__inject_script(script);
    } catch (error) {
      throw error;
    }
  }

  __inject_script({ type, content, url }) {
    let tagEl;

    // https://sourcemaps.info/spec.html
    let sourceURL = `//# sourceURL=${url};`;

    if (type == "js") {
      tagEl = document.createElement("script");
      tagEl.setAttribute("type", "text/javascript");
      // add source url
      content += `\n${sourceURL}`;
    } else if (type == "css") {
      tagEl = document.createElement("style");
      tagEl.setAttribute("type", "text/css");
      tagEl.setAttribute("rel", "stylesheet");
      // add source url
      content += `\n/* ${sourceURL} */`;
    }

    tagEl.setAttribute("data-url", url);

    this.headEl.appendChild(tagEl);

    tagEl.textContent = content;

    return { tagEl, type, content };
  }
}

// expose via window for browser use
window.ajax = ajax;
window.Scriptin = Scriptin;
