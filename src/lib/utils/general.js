/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
'use strict';

export function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function toDataURI(content) {
  // ony work with blobs
  if (content instanceof Blob == false) return Promise.resolve(content);

  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(content);
  });
}

export function injectScript(script) {
  var tagEl;

  // https://sourcemaps.info/spec.html
  var sourceURL = `//# sourceURL=${script.url};`;
  var content = script.content.data;

  var headEl =
    document.querySelector('head') ||
    document.querySelector('body') ||
    document.querySelector('html');


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


export function delay (time=1000) {
   return new Promise((resolve) => setTimeout(resolve, time));
}

export function hash(s) {
  s = String(s);
  var h = 0,
    l = s.length,
    i = 0;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return 'h' + String(h).replace('-', 'Z');
}

export function merge(target, source) {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (var key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(source[key], merge(target[key] || {}, source[key]));
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
}


export function getHost() {
  // obtain plugin path from the script element
  var src;
  var path = '/scriptin.js';

  if (document.currentScript) {
    src = document.currentScript.src;
  } else {
    var sel = document.querySelector('script[src$="'+path+'"]')
    if (sel) {
      src = sel.src;
    }
  }


  return src.replace(path,'');
}


export function isClass(val) {
  if(!val) return false
  var propertyNames = Object.getOwnPropertyNames(val);
  return propertyNames.includes('prototype') && !propertyNames.includes('arguments');
}

export function isFunction(val) {
  return typeof val === 'function' && !isClass(val);
}

export function isAbsoluteURL(url){
  return /^(?:[a-z+]+:)?\/\//.test(url)
}

export function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}