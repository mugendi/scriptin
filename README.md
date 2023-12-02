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
    .then(() => {
        console.log('JQuery loaded in ' + (Date.now() - startTime) + ' ms');
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

## API

### `new Scriptin({ttl:number})`

You can set a global `ttl` that will determine how long cached items are kept in the cache. The default value is `2592000` seconds or **1 month**.

### **`load(files)`**

Expects an array of urls or objects in the form of:

```javascript
{ url:'/url/to/load', test:condition, cache:boolean, ttl:number, dev:true }
```

Loads the scripts via AJAX ([See Exports](#note-on-exports)) and injects the code to the header.

-   **`test`** : if test evaluates to a _truthy_ value, then the script/css is loaded.
-   **`cache`** : is `true` be default. Set to `false` to prevent specific files from being cached.
-   **`ttl`**: determines how long the script/style is cached. Value is in seconds.

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

        const { data, headers } = await ajax.get(url);
    } catch (error) {
        throw error;
    }
})();
```

## Check Out Example!

To test the library, download and build (`yarn build`) then serve/load [Example](./example/)
