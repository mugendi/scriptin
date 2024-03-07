/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

(() => {
  const { ajax } = scriptin;

  async function run() {
    clearLog();

    let url = 'http://ip-api.com/json';

    log('Fetching data from: ' + url);
    let { data, headers } = await ajax.get(url);

    log({ data, headers });

    log('You might need to parse the data if json like this 👇');

    data = JSON.parse(data);
    log(data);

    url = 'http://httpbin.org/anything';

    log('let us now try POST this 👇 data to ' + url);
    log(withLoveData);

    let resp = await ajax.post(url, withLoveData);

    log(JSON.parse(resp.data));
  }

  $(function () {
    $('button#ajax').click(run);
  });
})();
