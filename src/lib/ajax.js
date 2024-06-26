/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import isAbsoluteUrl from './utils/url';

// Ref:https://gist.github.com/Danilovonline/1b87ef2ff1b1e0b19714a8b2e6246856
function httpRequest(
  url,
  method,
  data,
  opts,
  success_callback,
  failure_callback
) {
  var xhr;

  // defaults options
  var defaultOpts = { headers: {
  } };

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
    var versions = [
      'MSXML2.XmlHttp.5.0',
      'MSXML2.XmlHttp.4.0',
      'MSXML2.XmlHttp.3.0',
      'MSXML2.XmlHttp.2.0',
      'Microsoft.XmlHttp',
    ];

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

  if (
    ua.indexOf('msie') != -1 &&
    ua.indexOf('opera') == -1 &&
    ua.indexOf('webtv') == -1
  ) {
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

  url = formatURL(url);

  xhr.open(method, url, true);

  // xhr.withCredentials = true;

  if (opts.responseType) {
    xhr.responseType = opts.responseType;
  }

  for (var key in headers) {
    // console.log({ [key]: headers[key] });
    xhr.setRequestHeader(key, headers[key]);
  }

  xhr.send(data);
}

function formatURL(url) {
  if (isAbsoluteUrl(url)) {
    return url;
  }

  url = new URL(url, document.baseURI).href;

  return url;
}

class Ajax {
  constructor({
    methods = ['get', 'post', 'head', 'put', 'post', 'patch', 'delete'],
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
      httpRequest(
        url,
        method,
        data,
        opts,
        function (xhr) {
          // console.log(">>>>", xhr.response==xhr.responseText);
          // console.log(xhr);
          resolve({ data: xhr.response, headers: xhr.headers });
        },
        reject
      );
    });
  }
}

export default new Ajax();
