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
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import gzipPlugin from 'rollup-plugin-gzip';
import { babel } from '@rollup/plugin-babel';
import clean from '@rollup-extras/plugin-clean';
import css from 'rollup-plugin-import-css';
import hmr from 'rollup-plugin-reloadsite';

import { readdirSync } from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brotliPromise = promisify(brotliCompress);

const production = !process.env.ROLLUP_WATCH;

const defaultConfig = {
  external: [/@babel\/runtime/],
  output: {
    dir: 'dist',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    production && clean(),

    css(),

    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      plugins: [
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-instanceof',
        '@babel/plugin-transform-shorthand-properties',
        // "@babel/plugin-transform-spread",
        // Too much bloat added
        // "@babel/plugin-transform-object-rest-spread",
        '@babel/plugin-transform-optional-chaining',
        '@babel/plugin-transform-async-to-generator',
      ],
    }),

    // uglify
    production &&
      terser({
        format: {
          comments: false,
        },
      }),

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
        filter: ['**/scriptin.js'],
      }),
  ],
};

let configs = [
  merge(
    {
      input: {
        scriptin: 'src/index.js',
      },
      output: {
        name: 'ScriptIn',
      },
    },
    defaultConfig
  ),
];

// get all plugins...
const plugins = readdirSync('./src/plugins');
const pluginsConf = plugins.map((fileName) => {
  let name = fileName.replace(/\.js$/, '');

  let config = merge(
    {
      input: {
        ['plugins/' + name]: 'src/plugins/' + fileName,
      },
      output: {
        format: 'iife',
        name: 'ScriptIn' + name,
      },
    },
    defaultConfig
  );

  // config.external.push(/style-object-to-css-string/)

  // console.log(config);

  return config;
});

// export default [defaultConf].concat(pluginsConf);
export default configs.concat(pluginsConf);
