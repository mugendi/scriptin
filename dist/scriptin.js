var ScriptIn=function(){"use strict";function e(e,t,n,r,i,o,a){try{var s=e[o](a),c=s.value}catch(e){return void n(e)}s.done?t(c):Promise.resolve(c).then(r,i)}function t(t){return function(){var n=this,r=arguments;return new Promise((function(i,o){var a=t.apply(n,r);function s(t){e(a,i,o,s,c,"next",t)}function c(t){e(a,i,o,s,c,"throw",t)}s(void 0)}))}}function n(e,t){return null!=t&&"undefined"!=typeof Symbol&&t[Symbol.hasInstance]?!!t[Symbol.hasInstance](e):e instanceof t}var r=new class{constructor({methods:e=["get","post","head","put","post","patch","delete"]}={}){var t=this;e.forEach((function(e){t[e]=function(t,n,r={}){return this.__fetch(t,e,n,r)}}))}__fetch(e,t,n,r){return new Promise((function(i,o){!function(e,t,n,r,i,o){var a,s={headers:{}};t=t.toUpperCase(),["POST","PUT"].indexOf(t)>-1&&(s.headers["content-type"]="application/json"),r=Object.assign(s,r);var c={};for(var u in r.headers)c[u.toLowerCase()]=r.headers[u];var l=[];if("object"==typeof n)if("application/json"==c["content-type"])n=JSON.stringify(n);else{for(var d in n)n.hasOwnProperty(d)&&(l[l.length]=d+"="+n[d]);n=l.join("&")}if("undefined"!=typeof XMLHttpRequest)a=new XMLHttpRequest;else for(var p=["MSXML2.XmlHttp.5.0","MSXML2.XmlHttp.4.0","MSXML2.XmlHttp.3.0","MSXML2.XmlHttp.2.0","Microsoft.XmlHttp"],f=0,h=p.length;f<h;f++)try{a=new ActiveXObject(p[f]);break}catch(e){}var v=navigator.userAgent.toLowerCase();for(var y in a.onreadystatechange=function(){if(this.readyState===this.HEADERS_RECEIVED){var e=a.getAllResponseHeaders().trim().split(/[\r\n]+/),t={};e.forEach((function(e){var n=e.split(": "),r=n.shift().toLowerCase(),i=n.join(": ");t[r]=i})),a.headers=t}},-1!=v.indexOf("msie")&&-1==v.indexOf("opera")&&-1==v.indexOf("webtv")?a.onreadystatechange=function(){4===this.readyState&&(this.status>=200&&this.status<400?i(a):o(a))}:a.onload=function(e){200==this.status?i(a):o(a)},t||(t="GET"),t=t.toUpperCase(),a.open(t,e,!0),a.withCredentials=!0,r.responseType&&(a.responseType=r.responseType),c)a.setRequestHeader(y,c[y]);a.send(n)}(e,t,n,r,(function(e){i({data:e.response,headers:e.headers})}),o)}))}},i=function(){var e=0,t=/[\s,]+/g;function n(e){this.head=new r,this.tail=new r(this.head),this.head.next=this.tail,this.linkConstructor=e,this.reg={}}function r(e,t,n){this.prev=e,this.next=t,this.fn=n||i}function i(){}function o(){this.events={}}return n.prototype={insert:function(e){var t=new r(this.tail.prev,this.tail,e);return t.next.prev=t.prev.next=t,t},remove:function(e){e.prev.next=e.next,e.next.prev=e.prev}},r.prototype.run=function(e){this.fn(e),this.next&&this.next.run(e)},o.prototype={constructor:o,on:function(r,i,o){var a=this;i=i.bind(o||null),r.split(t).forEach((function(t){var r=a.events[t]||(a.events[t]=new n),o=i._eev||(i._eev=++e);r.reg[o]||(r.reg[o]=r.insert(i))}))},off:function(e,n){var r=this;n&&e.split(t).forEach((function(e){var t=r.events[e];if(t){var i=t.reg[n._eev];t.reg[n._eev]=void 0,t&&i&&t.remove(i)}}))},emit:function(e,t){var n=this.events[e];n&&n.head.run(t)}},o}();class o{constructor(e){this.name=e.name}getItem(e){var n=this;return t((function*(){return a((yield n.__getStore()).get(e),"Failed to get item")}))()}setItem(e,n){var r=this;return t((function*(){return a((yield r.__getStore()).put(n,e),"Failed to set item")}))()}removeItem(e){var n=this;return t((function*(){return a((yield n.__getStore()).delete(e),"Failed to remove item")}))()}clear(){var e=this;return t((function*(){return a((yield e.__getStore()).clear(),"Failed to clear store")}))()}__getStore(){var e=this;return t((function*(){return(yield e.__initDb()).transaction("store","readwrite").objectStore("store")}))()}__initDb(){return void 0===this.db&&(this.db=this.__openDb()),this.db}__openDb(){var e=indexedDB.open(this.name,1);return e.addEventListener("upgradeneeded",(function(){e.result.createObjectStore("store")})),a(e,"Failed to open IndexedDB")}}function a(e,t){return new Promise((function(n,r){e.addEventListener("success",(function(){n(e.result)})),e.addEventListener("error",(function(){r(t)}))}))}class s{constructor(e){this.name=e.name;var t=["getItem","setItem","removeItem","clear"];for(var n in t)this[t[n]]=function(e){var t,n=arguments,r=this.__formatKey(n[1]),i=n[2];return i&&(i=JSON.stringify(i)),(t=i?localStorage[e](r,i):localStorage[e](r))&&(t=JSON.parse(t)),t}.bind(this,t[n])}__formatKey(e){return[this.name,e].join(":")}}class c{constructor(e={}){return this.options=Object.assign({name:window.location.host,debug:!1},e),this.initStore()}initStore(){var e;return window.indexedDB||window.webkitIndexedDB||window.mozIndexedDB||window.msIndexedDB?(e=new o(this.options)).dbType="indexedDB":window.localStorage&&((e=new s(this.options)).dbType="localStorage"),this.options.debug&&console.log("Database Used: ",e.dbType),e}}function u(e){var t=Object.prototype.toString.call(e);return n(e,Date)||"object"==typeof e&&"[object Date]"===t?new e.constructor(+e):"number"==typeof e||"[object Number]"===t||"string"==typeof e||"[object String]"===t?new Date(e):new Date(NaN)}function l(e,t){return function(e,t){return n(e,Date)?new e.constructor(t):new Date(t)}(e,+u(e)+t)}function d(e,t){return l(e,1e3*t)}function p(e,t){return+u(e)<+u(t)}function f(e){return void 0===e?[]:Array.isArray(e)?e:[e]}function h(e){var t=0,n=(e=String(e)).length,r=0;if(n>0)for(;r<n;)t=(t<<5)-t+e.charCodeAt(r++)|0;return"h"+String(t).replace("-","Z")}function v(e,t){for(var r of Object.keys(t))n(t[r],Object)&&Object.assign(t[r],v(e[r]||{},t[r]));return Object.assign(e||{},t),e}function y(e){return/^(?:[a-z+]+:)?\/\//.test(e)}const m=["IsLoading","Details","AutoResource"];var g="✓",_="✖",b=function(){var e,t="/scriptin.js";if(document.currentScript)e=document.currentScript.src;else{var n=document.querySelector('script[src$="'+t+'"]');n&&(e=n.src)}return e.replace(t,"")}();return class{constructor(e={}){this.scriptHost=b,this.options=v({ttl:0,injectToHead:!0,debug:!1,ignoreURLParams:!0},e),this.events=new i,this.ajax=r,this.store=new c,this.Scriptin=this,this.__init(),this.loadedPlugins={}}__init(){this.__listener(),this.__init_plugins()}on(e,t){for(var n in e=f(e))this.events.on(e[n],t)}load(e,n){var r=this;return t((function*(){try{var t,i=r;e=f(e);var o=[];for(var a in e)if(!1!=!!(t=e[a])){"string"==typeof t&&(t={url:t});var s=t.url;r.options.ignoreURLParams&&(s=s.replace(/[#\?].+$/,"")),t.cache=!1!==t.cache,t.ttl=t.ttl||r.options.ttl||0,t.meta={key:h(s)};var c=yield r.__loadScript(t);if(o.push(c),c){var u=(null==n?void 0:n.event)||"loaded",l=null==n?void 0:n.parent;c.parent=l,i.events.emit(u,c),i.events.emit(c.url,c),i.events.emit(c.content.type,c),i.events.emit(c.content.category,c)}}return yield Promise.all(o).then((function(e){var t={};for(var n in e)t[e[n].url]=e[n];return t}))}catch(e){var d;null!=i&&null!==(d=i.options)&&void 0!==d&&d.debug&&console.error({error:e});var p=e.stack||e.stacktrace,v={error:{status:e.status||e.message,details:e.statusText||p},script:t};i.events.emit("error",v)}}))()}__init_plugins(){var e=this;return t((function*(){var n=e;try{n.pluginsLoaded=n.pluginsLoaded||[],n.events.on("plugin-loaded",function(){var e=t((function*(e){var t=e.url.split("/").pop().replace(/\.js$/,""),r=window["ScriptIn"+t],i=e.parent;if(function(e){if(!e)return!1;var t=Object.getOwnPropertyNames(e);return t.includes("prototype")&&!t.includes("arguments")}(r)){let e=new r(v(n,{pluginName:t,parent:i}));if(e.dependencies){var o=f(e.dependencies);yield n.__loadPlugins(o,t)}e.init&&e.init()}}));return function(t){return e.apply(this,arguments)}}());var r=Object.keys(e.options.plugins),i=m.filter((function(e){return r.indexOf(e)>-1}));yield e.__loadPlugins(i)}catch(e){console.error(e)}}))()}__loadPlugins(e,n){var r=this;return t((function*(){var t;for(var i in e){var o;t=e[i],o=y(e[i])?e[i]:r.scriptHost+"/plugins/"+t+".js",r.pluginsLoaded.indexOf(o)>-1||(r.pluginsLoaded.push(o),yield r.load(o,{event:"plugin-loaded",parent:n}))}}))()}__loadScript(e){var n=this;return t((function*(){var t=n,r=new Date;if(e.meta.cache={enabled:_},"test"in e&&!1==!!e.test)return n.__log('"'+e.url+'" is skipped as the test failed.'),null;if(e.cache){e.meta.cache.enabled=g,e.meta.cache.status=_;var i=yield n.store.getItem(e.meta.key);if(i){e.ttl!==i.ttl,e.returnType!==i.returnType||(e.meta.cache.status=g,e=v(i,e))}}if(e.meta.cache.status==g){if("number"==typeof e.ttl&&e.ttl>0&&e.meta.fetched)p(d(e.meta.fetched,e.ttl),r)&&(yield t.store.removeItem(e.meta.key),e.meta.cache.status=_,delete e.content);t.__validateCache(e)}if(e.meta.cache.status==_){var o=yield t.__fetchScript(e),a=parseFloat(o.headers["content-length"])||null;e.content=o.content,e.meta.fetched=r,e.meta.size=a,e.meta.cache.enabled==g&&t.store.setItem(e.meta.key,e)}return!t.options.injectToHead||"javascript"!=e.content.type&&"css"!=e.content.type||function(e){var t,n=`//# sourceURL=${e.url};`,r=e.content.data,i=document.querySelector("head")||document.querySelector("body")||document.querySelector("html");"javascript"==e.content.type?((t=document.createElement("script")).setAttribute("type","text/javascript"),r+=`\n${n}`):"css"==e.content.type&&((t=document.createElement("style")).setAttribute("type","text/css"),t.setAttribute("rel","stylesheet"),r+=`\n/* ${n} */`),t.setAttribute("data-url",e.url),t.textContent=r,i.appendChild(t)}(e),e}))()}__listener(){var e,n=this;function r(e){return i.apply(this,arguments)}function i(){return(i=t((function*(e){r.keys=r.keys||[],r.intVar=r.intVar,clearTimeout(r.intVar),r.intVar=setTimeout((function(){r.keys=[]}),1e3),e.ctrlKey&&-1==r.keys.indexOf("CTRL")&&r.keys.push("CTRL"),e.code&&r.keys.push(e.code),r.keys.indexOf("KeyR")>-1&&r.keys.indexOf("CTRL")>-1&&(e.preventDefault(),yield n.store.clear(),window.location.reload())}))).apply(this,arguments)}document.addEventListener("keydown",r),this.events.on("stateIsDirty",(function(){clearTimeout(e),e=setTimeout((function(){window.location.reload()}),1e3)}))}__validateCache(e){var n=this;return t((function*(){var t,i,o=n,a=yield r.head(e.url);(t=a.headers,i=e.meta.fetched,!!(t["last-modified"]&&p(i,new Date(t["last-modified"]))||(t.expires&&p(new Date(t.expires),i),t["cache-control"]&&p(d(i,t["cache-control"].split(",").map((function(e){return e.split("=")})).filter((function(e){return 2==e.length&&e[0].indexOf("age")>-1})).map((function(e){return parseInt(e[1])}))[0]),i))))&&(o.__log('"'+e.url+'" has expired or been modified. Cache will be invalidated and server reloaded.'),o.events.emit("stateIsDirty",!0),yield o.store.removeItem(e.meta.key))}))()}__fetchScript(e){var i=this;return t((function*(){i.__log("fetching ",e.url);var t=null,o="dataURI"===e.returnType;o&&(t="blob");var a,s=yield r.get(e.url,{},{responseType:t});o&&(s=v(s,{data:yield(a=s.data,0==n(a,Blob)?Promise.resolve(a):new Promise((function(e,t){var n=new FileReader;n.onloadend=function(){e(n.result)},n.readAsDataURL(a)})))}));var c,u,l=(c=s.headers,{category:(u=(c["content-type"]||"").toLowerCase().split(";")[0].split("/"))[0]||"?",type:u[1]||u[0]||"?"}),d=s.data;if("json"==l.type)try{d=JSON.parse(d)}catch(e){console.error(e)}return{content:d=v({data:d},l),headers:s.headers}}))()}__log(){this.options.debug&&console.log.apply(null,arguments)}}}();
//# sourceMappingURL=scriptin.js.map
