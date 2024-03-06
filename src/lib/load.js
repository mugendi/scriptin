/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

'use strict';

import ajax from './ajax.js';
import { checkHeaderExpiry, getHeaderType, toDataURI } from './utils.js';
import { storeGet, storeSet, del } from './store/index.js';
import { addSeconds, isBefore } from 'date-fns';

export function loadScript(script, options = {}) {
  // console.log({options});
  var now = new Date();
  var TTL = null;

  // set TTL
  if (typeof options.ttl == 'number' && options.ttl > 0) {
    TTL = options.ttl;
  }

  // This Promise/then cascade and others in this code are intentional in order to improve browser compatibilty

  // check if script in store
  return storeGet(script)
    .then(function (cachedScript) {
      // if we have cached data
      if (cachedScript) {
        var resetCache = resetScriptCache(script, cachedScript, TTL, now);

        if (resetCache) {
          // remove value
          del(script.url);
          return null;
        }

        // indicate is form cache
        cachedScript.fromCache = true;
      }

      // return cached....
      return cachedScript;
    })
    .then(function (cachedScript) {
      if (cachedScript) {
        if (options) return cachedScript;
      }

      var responseType = null;

      if (script.returnType === 'dataURI') {
        responseType = 'blob';
      }

      options.debug && console.log('Loading: ' + script.url + '...');

      // load script via ajax
      return ajax
        .get(script.url, {}, { responseType: responseType })
        .then(function (ajaxResp) {
          // cache script
          // otherwise load

          var content = ajaxResp.data;

          // get/make data URI
          if (script.returnType === 'dataURI') {
            return toDataURI(content).then(function (content) {
              return { ajaxResp, content };
            });
          }

          return { ajaxResp, content };
        })
        .then(function (resp) {
          var ajaxResp = resp.ajaxResp;
          var content = resp.content;

          // 1. Add important headers
          var typeObj = getHeaderType(ajaxResp);

          // {contentCategory, contentType}
          script.contentType = typeObj.contentType;
          script.contentCategory = typeObj.contentCategory;

          // parse JSON where possible
          if (typeObj.contentType == 'json') {
            content = JSON.parse(content);
          }

          // 2. Add content to script
          script.content = content;

          var scriptExpiry = checkHeaderExpiry(script, ajaxResp);

          script = Object.assign(script, scriptExpiry);

          // if we do not want to cache, stop right here
          if (script.cache === false) {
            return script;
          }

          // if ttl, determine expires
          if (TTL) {
            var seconds = options.ttl;
            script.ttl = TTL;
            script.ttlTill = addSeconds(now, seconds);
          }
          // delete expires unless ttl is set
          else if (script.ttlTill) {
            delete script.ttlTill;
          }

          // save cache
          storeSet(script);
          // indicate is not from cache
          script.fromCache = false;

          return script;
        });
    })
    .then(function (script) {
      if (
        options.injectToHead &&
        (script.contentType == 'javascript' || script.contentType == 'css')
      ) {
        injectScript(script);
      }

      // Finally, if from cache, check that file has not changed
      if (script.fromCache) {
        // console.log(JSON.stringify(script, 0, 4));
        checkScriptExpiry(script).catch(console.error);
      }

      return { status: 'ok', script: script };
    })
    .catch(function (error) {
      options.debug && console.error(error);

      var stack = error.stack || /*old opera*/ error.stacktrace;

      return {
        status: 'error',
        error: {
          status: error.status || error.message,
          details: error.statusText || stack,
        },
        script: script,
      };
    });
}

function resetScriptCache(script, cachedScript, TTL, now) {
  var reset = false;

  // if expired
  if (cachedScript.ttlTill) {
    reset = isBefore(cachedScript.ttlTill, now);
  }
  // if ttl is set and cache did hot have ttlTill
  if (TTL && !cachedScript.ttlTill) {
    reset = true;
  }
  // if TTL values dont match
  if (TTL && TTL !== cachedScript.ttl) {
    reset = true;
  }
  // if content type has changed
  if (script.returnType && script.returnType !== cachedScript.returnType) {
    reset = true;
  }

  return reset;
}

function checkScriptExpiry(script) {
  // make head request
  return ajax.head(script.url).then(function (ajaxResp) {
    // console.log(scr);

    var scriptExpiry = checkHeaderExpiry(script, ajaxResp);

    // console.log(script.url, JSON.stringify(scriptExpiry, 0, 4));
    if (scriptExpiry.isExpired) {
      console.log(script.url, ' changed. Reloading...');
      // delete script cache
      del(script.url)
        .then(function (resp) {
          //   console.log('Purged', script.url);
          setTimeout(function () {
            window.location.reload();
          }, 0);
        })
        .catch(console.error);
    }
  });
  //
}

function injectScript(script) {
  var tagEl;

  // https://sourcemaps.info/spec.html
  var sourceURL = `//# sourceURL=${script.url};`;
  var content = script.content;
  var headEl =
    document.querySelector('head') ||
    document.querySelector('body') ||
    document.querySelector('html');

  if (script.contentType == 'javascript') {
    tagEl = document.createElement('script');
    tagEl.setAttribute('type', 'text/javascript');
    // add source url
    content += `\n${sourceURL}`;
  } else if (script.contentType == 'css') {
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
