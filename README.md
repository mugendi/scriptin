<!--
 Copyright (c) 2023 Anthony Mugendi

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Script-In

This is a Javascript and css resource loader that uses [loclaforage](https://www.npmjs.com/package/loclaforage) to cache dynamically loaded files to ensure they load instantly the second time.

## But Why

When you are building big JS apps, the duration it takes to load some of the needed resources can be long, especially for users with slow internet. Script-In in what you need _to bring your scripts in magically!_

## Usage

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
    }
];

await scriptin.load(scripts);
```

## API

### **`load(files)`** 
Expects an array of urls or objects in the form of:

```javascript
{ url:'/url/to/load', test:condition, cache:boolean }
```
Loads the scripts via AJAX ([axios](https://www.npmjs.com/package/axios)) and injects the code to the header.

- **`test`** : if test evaluates to a *truthy* value, then the script/css is loaded.
- **`cache`** : is `true` be default. Set to `false` to prevent specific files from being cached.

### **`clear()`** 
Clears all caches.

## Check Out Example!

To test the library, download and build (`yarn build`) then serve/load [Example](./example/)
