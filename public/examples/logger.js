/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const logEl = document.getElementById('log');
function log(message) {
  if (typeof message == 'object') {
    message = JSON.stringify(message, 0, 4);
  }
  
  log.lineNum = log.lineNum || 1;

  let sep =
    '----------------------[log:' + log.lineNum + ']----------------------\n\n';

  if (log.lineNum > 1) {
    sep = '\n\n' + sep;
    message = logEl.innerText + sep + message;
  } else {
    message = sep + message;
  }

  //   console.log(sep);
  logEl.innerText = message;

  log.lineNum++;
}

function clearLog() {
  logEl.innerText = '';
  log.lineNum = 0;
}
