/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { isBefore, addSeconds } from './dateFns';

export function getHeaderType(headers) {
  // console.log(script);
  var contentType = (headers['content-type'] || '').toLowerCase();
  var arr = contentType.split(';')[0].split('/');

  return { category: arr[0] || "?", type: arr[1] || arr[0] || "?" };
}

export function hasExpiredHeader(headers, dateFetched) {
  // if last modified header
  if (
    headers['last-modified'] &&
    isBefore(dateFetched, new Date(headers['last-modified']))
  ) {
    return true;
  }

  // use expires headers
  if (
    headers['expires'] &&
    isBefore(new Date(headers['expires']), dateFetched)
  ) {
    // return true;
  }

  //otherwise check using max age
  if (headers['cache-control']) {
    var arr = headers['cache-control']
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

    var maxAge = arr[0];
    var expiresOn = addSeconds(dateFetched, maxAge);

    if (isBefore(expiresOn, dateFetched)) {
      return true;
    }
  }

  return false;
}
