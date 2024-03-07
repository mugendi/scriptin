/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

(() => {
  const { store } = scriptin;

  async function run() {
    clearLog();

    // log database used
    log('Database in use: ' + store.dbType);

    // set data
    log('setting data');

    let key = 'randomKey';
    
    await store.setItem(key, withLoveData);

    // read data
    await readData(key);

    // del data
    log('deleting data');

    await store.removeItem(key);

    // try read again
    await readData(key);

    //   you can also clear
    await store.clear(key);
  }

  async function readData(key) {
    log('reading data');
    let resp = await store.getItem(key);
    log(resp);
  }

  $(function () {
    $('button#store').click(run);
  });
})();
