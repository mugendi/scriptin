/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { promisify } from 'util';
import { brotliCompress } from 'zlib';
import { terser } from 'rollup-plugin-terser';
// Using a modified version that adds the last-modified header...
import serve from './dev/rollup-plugin-serve/index.cjs.js';
import hmr from 'rollup-plugin-reloadsite';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import gzipPlugin from 'rollup-plugin-gzip';

const brotliPromise = promisify(brotliCompress);

const production = !process.env.ROLLUP_WATCH;

export default {
  input: {
    scriptin: 'src/index.js',
  },
  output: {
    dir: 'dist',
    format: 'iife',
    sourcemap: true,
    name: 'Scriptin',
  },

  external: ['date-fns'],

  plugins: [
    // uglify
    production &&
      terser(),

    // GZIP compression as .gz files
    production && gzipPlugin(),
    // Brotli compression as .br files
    production &&
      gzipPlugin({
        customCompression: (content) => brotliPromise(Buffer.from(content)),
        fileName: '.br',
      }),

    // size breakdown
    sizes({
      details: true,
    }),

    // total package size
    filesize(),

    // serve on dev mode
    !production &&
      serve({
        contentBase: ['public', 'dist'],
        verbose: true,
        port: 5000,
      }),

    // enable hot module reload
    !production &&
      hmr({
        // directories to watch
        dirs: ['./dist', './public'],
        // defaults tp 35729
        port: 35729,
      }),
  ],
};
