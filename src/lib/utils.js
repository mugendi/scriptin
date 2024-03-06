/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
'use strict';

import { isBefore, addSeconds } from 'date-fns';

export function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

export function getHeaderType(ajaxResp) {
  // console.log(script);
  var contentType = (ajaxResp.headers['content-type'] || '').toLowerCase();
  var type = contentType.split(';')[0];
  var arr = type.split('/');

  var contentCategory = arr[0];
  contentType = arr[1] || arr[0];

  return { contentCategory, contentType };
}

export function checkHeaderExpiry(script, ajaxResp) {
  var headers = ajaxResp.headers;
  var lastModified = headers['last-modified'];
  var cacheControl = headers['cache-control'];

  var now = new Date();
  // always assume expiry after 1 s
  var expires = addSeconds(now, 1);

  // If script has a date element
  var date;

  // set date if last-modified header
  if (script.date) {
    date = script.date;
  } else if (lastModified) {
    date = new Date(lastModified);
  } else if (headers.date) {
    date = new Date(headers.date);
  } else {
    date = now;
  }

  var isExpired = false;

  //   prefer cache control
  if (cacheControl) {
    var arr = cacheControl
      .split(',')
      .map(function (v) {
        return v.split('=');
      })
      .filter(function (arr) {
        return arr.length == 2 && arr[0].indexOf('age') > -1;
      })
      .map(function (a) {
        return parseInt(a[1]);
      });

    var maxAge = Math.min.apply(null, arr);
    // Calculate expiry date
    expires = addSeconds(date, maxAge);
    isExpired = isBefore(expires, date);
  } else if (headers.expires) {
    expires = new Date(headers.expires);
    isExpired = isBefore(expires, date);
  } else if (lastModified) {
    // console.log({lastModified});
    // we want to see that last modified is less than date
    isExpired = isBefore(date, lastModified);
  }

  return { date, expires, isExpired, lastModified };
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
