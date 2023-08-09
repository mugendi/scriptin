/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const webpack = require('webpack');
const path = require('path');
const Uglify = require('uglifyjs-webpack-plugin');


module.exports = {
    mode:process.env.NODE_ENV,
    entry: './src/scriptin.js',
    output: {
        filename: 'scriptin.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.ProvidePlugin({
            localforage: 'localforage',
            Scriptin: 'Scriptin',
        }),
    ],

    optimization: {
        minimize: process.env.NODE_ENV == 'production',
        minimizer: [
            new Uglify({
                // cache: true,
                test: /\.js(\?.*)?$/i,
            }),
        ],
    },
};
