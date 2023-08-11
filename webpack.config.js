/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './src/scriptin.js',

    output: {
        clean: true,
        filename: 'scriptin.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.ProvidePlugin({
            ajax: 'ajax',
            Scriptin: 'Scriptin',
        }),

        process.env.NODE_ENV == 'production' && new CompressionPlugin(),
    ],

    optimization: {
        minimize: process.env.NODE_ENV == 'production',
        minimizer: [new TerserPlugin()],
    },
};
