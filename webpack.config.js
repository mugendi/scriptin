/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: process.env.NODE_ENV,
    entry: './src/scriptin.js',

    output: {
        clean: true,
        filename: 'scriptin.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'scriptin',
        libraryTarget: 'umd'
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
