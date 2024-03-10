/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

let options = {
  ttl: 0,
  injectToHead: true,
  debug: true,

  plugins: {
    // IsLoading: {
    //   styles: {
    //     background: '#f1f1f1',
    //     border: '#ddd 1px solid',
    //     'border-radius': '20px',
    //     'box-shadow': 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    //   },
    // },
    Details: {
      showHeaders: true,
      filter: ['meta', 'cache'],
      styles: {
        '.scriptin-details h4': {
          color: 'red',
        },
      },
    },
    //  Details:{},
    // AutoResource:{},
    // Details:{},
   
  },
};
let scriptin = new ScriptIn(options);


scriptin.on('loaded', (data) => {
  // console.log('loaded', data.url);
});

/*
 scriptin.load(
  [
    {
      test: !window.jQuery,
      url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js?ts=434633',
      cache:false
    },
    'http://ip-api.com/json/24.48.0.1',
    'js/test.js#54484',
    // 'js/test2.js',
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
      ttl:10
    },
  ]
)
*/

// scriptin.on('error', (data) => {
//   console.error(data);
// });

// scriptin.on('audio', (data) => {
//   let audio = document.createElement('audio');
//   audio.controls = true;
//   audio.src = data.content.data;
//   document.body.appendChild(audio);
// });

// scriptin.on(['image'], (data) => {
//   let img = document.createElement('img');
//   img.src = data.content.data;
//   document.body.appendChild(img);
// });
