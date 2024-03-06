/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

console.log(Scriptin);

let loader = Scriptin.load(
  [
    /*
     */
    {
      test: !window.jQuery,
      url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js',
    },
    'http://ip-api.com/json/24.48.0.1',
    'test.js',
    'test2.js',
    {
      // url: 'https://cdn.pixabay.com/download/audio/2023/11/25/audio_f469d11302.mp3?filename=carol-of-the-bells-xmas-background-hip-hop-music-for-video-30-second-178241.mp3',
      url:'https://cdn.pixabay.com/download/audio/2024/02/14/audio_b9bc3934cc.mp3?filename=perfect-beauty-191271.mp3',
      returnType: 'dataURI',
      cache: true,
    },
    // 'dd.js',
    {
      url: 'https://cdn.pixabay.com/photo/2023/04/11/13/27/bird-7917250_1280.jpg',
      returnType: 'dataURI',
      cache: true,
    },
  ],
  { ttl: 0, injectToHead: true, debug: true }
);



Scriptin.on('test.js', (data) => {
  console.log(data);
});

Scriptin.on('audio', (data) => {
  let audio = document.createElement('audio');
  audio.controls = true;
  audio.src = data.content;
  document.body.appendChild(audio);
});

Scriptin.on(['image'], (data) => {
  let img = document.createElement('img');
  img.src = data.content;
  document.body.appendChild(img);
});

let { store } = Scriptin;

// store
//   .set('test', { num: Math.random() * 1000, date: new Date() , b:'one'})
//   .then((resp) => {
//     return store.get('test');
//   })
//   .then((resp) => {
//     console.log(resp);
//   })
//   .catch(console.error);

/* */

/*
.then((resp) => {
  let data = Scriptin.data(
    'https://cdn.pixabay.com/photo/2023/04/11/13/27/bird-7917250_1280.jpg'
  );

  console.log(resp);

  let img = document.createElement('img');
  img.src = data.content;
  document.body.appendChild(img);

  //  <audio controls src="/media/cc0-audio/t-rex-roar.mp3"></audio>

  let audio = document.createElement('audio');
  audio.controls = true;
  audio.src = Scriptin.data(
    'https://cdn.pixabay.com/download/audio/2023/11/25/audio_f469d11302.mp3?filename=carol-of-the-bells-xmas-background-hip-hop-music-for-video-30-second-178241.mp3'
  ).content;

  document.body.appendChild(audio);

  console.log();
});

*/
