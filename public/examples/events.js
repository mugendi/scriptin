/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

(() => {
  const { events } = scriptin;

  async function run() {
    clearLog();

    log('TESTING EVENTS...');

    log("First create an event listener for 'test-event'");

    events.on('test-event', function (data) {
      log("<< 'test-event' triggered. Data passed is 👇");
      log(data);
    });

    log(
      "let's wait for 3 seconds then fire the event and pass the following data"
    );
    log(withLoveData);

    let secs = 0;
    let intVar = setInterval(() => {
      secs++;

      log(secs + ' second');

      if ((secs >= 3)) {
        clearInterval(intVar);
        log(">> Firing 'test-event'");
        events.emit('test-event', withLoveData);
      }
    }, 1000);

    // console.log(events);
  }

  async function readData(key) {
    log('reading data');
    let resp = await store.getItem(key);
    log(resp);
  }

  $(function () {
    $('button#events').click(run);
  });
})();
