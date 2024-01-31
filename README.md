<!--
 Copyright (c) 2023 Anthony Mugendi

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Script-In

This is a Javascript and css resource loader that uses [store.js](https://github.com/marcuswestin/store.js) to cache dynamically loaded files to ensure they load instantly the second time.

## But Why

When you are building big JS apps, the duration it takes to load some of the needed resources can be long, especially for users with slow internet. Script-In in what you need _to bring your scripts in magically!_

Also I wanted a very tiny script that will be super fast to load and then manage all other scripts. Script-In weighs in at 3.6 kb when minified and 1.7kb when gzipped!

## Usage

For NodeJs

```javascript
import { Scriptin } from 'scriptin';
```

For Browser

```html
<script src="https://cdn.jsdelivr.net/gh/mugendi/scriptin@master/dist/scriptin.min.js"></script>
```

Then...

```javascript
let scriptin = new Scriptin();

scriptin
  .load(['https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js'])
  .then((resp) => {
    console.log('JQuery loaded in ' + (Date.now() - startTime) + ' ms');

    console.log(resp);
  });
```

## What if the scripts have already been loaded?

Scriptin allows you to load your scripts conditionally based on tests you can run on the browser.

Below is an example of how you would load jQuery and bootstrap files conditionally.

```javascript
let scripts = [
  {
    url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js',
    // only load if jquery is not loaded
    test: !window.jQuery,
  },
  {
    url: 'https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js',
    // only load if bootstrap is not loaded
    test: !jQuery.fn.emulateTransitionEnd,
  },
];

await scriptin.load(scripts);
```

## Json & other Files

It is worth noting that `load()` resolves with an object keyed by the url strings where each value is the content loaded by that url.

For example, you can load a json file and persist it in browser cache via the following code:

```javascript
let resp = await criptin.load(['/some-api/package.json']);

console.log(resp);

// access the JSON object via : resp['/some-api/package.json']
```

This will output the json:

```json
{
  "/some-api/package.json": {
    "name": "scriptin",
    "version": "1.0.12",
    "description": "Javascript and CSS loaded that uses localforage to cache scripts on browser for super-fast loads.",
    "main": "src/scriptin.js",
    ...
  }
}
```

This allows you to load and cache JSON and other content. Please note that JSON content types are automatically parsed when `content-type` header is correctly set to `json`.

As you will see below, the `content-type` and `last-modified` headers are very important and are used to determine how loaded content is handled. `javascript` and `css` files are automatically injected into the head.

## API

### `new Scriptin({ttl:number})`

You can set a global `ttl` that will determine how long cached items are kept in the cache. The default value is `2592000` seconds or **1 month**.

### **`load(files)`**

Expects an array of urls or objects in the form of:

```javascript
{
    url:'/url/to/load',
    test:condition,
    cache:boolean, //set to false ro disable cache
    ttl:number, // how long a script is to be cached
    inject: true // default = true. Set to false to stop scripts from injecting
}
```

Loads the scripts via AJAX ([See Exports](#note-on-exports)).

If the `url` loaded is either a javascript or css file (based on the `content-type` header returned) and `inject` is not `false` the file content is injected to the page `<head>`.

- **`test`** : if test evaluates to a _truthy_ value, then the script/css is loaded.
- **`cache`** : is `true` be default. Set to `false` to prevent specific files from being cached.
- **`ttl`**: determines how long the script/style is cached. Value is in seconds.
- **`inject`**: Determines if javascript and css tags are injected into the `<head>` of the page. Default is `true`

### **`clear()`**

Clears all caches.

### Note on exports

If importing this script, note that it also exports
`Scriptin` and `ajax`. Ajax has an API almost similar to [axios](https://www.npmjs.com/package/axios). Below is an example of how it is used.

```javascript
(async () => {
  try {
    import { ajax } from 'scriptin';

    const url = 'https://example.com';
    const payload = { test: 'data' };
    const opts = {
      headers: {
        // default POST/PUT header is 'application/json'
        'content-type': 'application/x-www-form-urlencoded',
      },
    };

    const { data, headers } = await ajax.post(url, payload, opts);
  } catch (error) {
    throw error;
  }
})();
```

## Invalidating Caches

This library is built to automatically invalidate caches when cached files change. However, for this to work, ensure that your server sends the correct `last-modified` header as the date will be used to determine which caches should be invalidated.

## Check Out Example!

To test the library, download and build (`yarn build`) then serve/load [Example](./example/)
