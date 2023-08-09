/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as forage from 'localforage';

const store = forage.createInstance({
    name: 'scripIn',
});

function arrify(v) {
    if (v === undefined) return [];
    return Array.isArray(v) ? v : [v];
}

export class Scriptin {
    constructor() {
        this.headEl = document.querySelector('head, body, html');
    }
    __init() {
        // only if axios is not already loaded
        if (window.axios) return;

        const axiosURL =
            'https://cdn.jsdelivr.net/npm/axios@1.4.0/dist/axios.min.js';

        return new Promise((resolve, reject) => {
            const tagEl = document.createElement('script');
            tagEl.setAttribute('src', axiosURL);
            this.headEl.appendChild(tagEl);
            tagEl.onload = function () {
                resolve();
            };
        });
    }

    async load(scripts) {
        // ensur array
        scripts = arrify(scripts);

        // map & format each script tag
        scripts = scripts
            .map((o) => {
                // make object if string url was given
                if (typeof o == 'string') {
                    o = { url: o };
                }

                return o;
            })
            .filter((o) => !o.hasOwnProperty('test') || o.test);

        let tagEl;
        for (let script of scripts) {
            tagEl = await this.__ajax_load(script);
        }
    }

    clear(){
        return store.clear()
    }

    async __ajax_load(script) {
        try {
            var { content, type } = (await store.getItem(script.url)) || {};

            if (!content) {
                await this.__init();

                var { content, type } = await axios
                    .get(script.url)
                    .then((resp) => {
                        // get type of loaded content

                        let contentType = resp.headers['content-type'];
                        let type;
                        if (contentType.indexOf('/css;') > -1) {
                            type = 'css';
                        } else if (contentType.indexOf('/javascript;') > -1) {
                            type = 'js';
                        }

                        return { type, content: resp.data };
                    });

                if (content && type) {
                    // save content
                    store.setItem(script.url, { content, type });
                }
            } else {
                console.log(script.url, 'loaded from cache');
            }

            script = Object.assign(script, { content, type });

            return await this.__inject_script(script);
        } catch (error) {
            throw error;
        }
    }

    __inject_script({ type, content }) {
        let tagEl;

        if (type == 'js') {
            tagEl = document.createElement('script');
            this.headEl.appendChild(tagEl);
            tagEl.textContent = content;
        } else if (type == 'css') {
            let tagEl = document.createElement('style');
            // tagEl.setAttribute('type', 'text/css');
            // tagEl.setAttribute('rel', 'stylesheet');
            this.headEl.appendChild(tagEl);
            tagEl.textContent = content;
        }

        return tagEl;
    }
}

export const localforage = forage

window.localforage = forage;
window.Scriptin = Scriptin;

