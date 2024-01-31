/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// Ref:https://gist.github.com/Danilovonline/1b87ef2ff1b1e0b19714a8b2e6246856
function httpRequest(url, method, data, success_callback, failure_callback) {
  var xhr;

  var data2 = [];
  if (typeof data == 'object') {
    for (var index in data) {
      if (data.hasOwnProperty(index)) {
        data2[data2.length] = index + '=' + data[index];
      }
    }
    data = data2.join('&');
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
      const headers = xhr.getAllResponseHeaders();
      // Convert the header string into an array
      // of individual headers
      const arr = headers.trim().split(/[\r\n]+/);

      // Create a map of header names to values
      const headerMap = {};
      arr.forEach(function (line) {
        const parts = line.split(': ');
        const header = parts.shift().toLowerCase();
        const value = parts.join(': ');
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

  // console.log({method});

  xhr.open(method, url, true);

  if (method == 'POST') {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }

  xhr.send(data);
}

class Ajax {
  constructor({ methods = ['get', 'post', 'head', 'put', 'post'] } = {}) {
    for (let method of methods) {
      this[method] = function (url, data, opts = {}) {
        return this.__fetch(url, method, data);
      };
    }
  }

  __fetch(url, method, data) {
    return new Promise(function (resolve, reject) {
      httpRequest(
        url,
        method,
        data,
        function (xhr) {
          // console.log(xhr);
          resolve({ data: xhr.responseText, headers: xhr.headers });
        },
        reject
      );
    });
  }
}

export default new Ajax();
