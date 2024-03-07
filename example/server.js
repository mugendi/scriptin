/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import serve from 'koa-static';
import koa from 'koa';
import path from 'path';


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = new koa();

app.use(serve(path.resolve(__dirname, './public'), { extensions: ['html'] }));
app.use(serve(path.resolve(__dirname, '../dist'), { extensions: ['html'] }));

app.listen(3000);
