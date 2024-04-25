var ScriptInDetails = (function () {
  'use strict';

  /**
   * Copyright (c) 2023 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */
  function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
  }

  const BYTE_UNITS = [
  	'B',
  	'kB',
  	'MB',
  	'GB',
  	'TB',
  	'PB',
  	'EB',
  	'ZB',
  	'YB',
  ];

  const BIBYTE_UNITS = [
  	'B',
  	'KiB',
  	'MiB',
  	'GiB',
  	'TiB',
  	'PiB',
  	'EiB',
  	'ZiB',
  	'YiB',
  ];

  const BIT_UNITS = [
  	'b',
  	'kbit',
  	'Mbit',
  	'Gbit',
  	'Tbit',
  	'Pbit',
  	'Ebit',
  	'Zbit',
  	'Ybit',
  ];

  const BIBIT_UNITS = [
  	'b',
  	'kibit',
  	'Mibit',
  	'Gibit',
  	'Tibit',
  	'Pibit',
  	'Eibit',
  	'Zibit',
  	'Yibit',
  ];

  /*
  Formats the given number using `Number#toLocaleString`.
  - If locale is a string, the value is expected to be a locale-key (for example: `de`).
  - If locale is true, the system default locale is used for translation.
  - If no value for locale is specified, the number is returned unmodified.
  */
  const toLocaleString = (number, locale, options) => {
  	let result = number;
  	if (typeof locale === 'string' || Array.isArray(locale)) {
  		result = number.toLocaleString(locale, options);
  	} else if (locale === true || options !== undefined) {
  		result = number.toLocaleString(undefined, options);
  	}

  	return result;
  };

  function prettyBytes(number, options) {
  	if (!Number.isFinite(number)) {
  		throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
  	}

  	options = {
  		bits: false,
  		binary: false,
  		space: true,
  		...options,
  	};

  	const UNITS = options.bits
  		? (options.binary ? BIBIT_UNITS : BIT_UNITS)
  		: (options.binary ? BIBYTE_UNITS : BYTE_UNITS);

  	const separator = options.space ? ' ' : '';

  	if (options.signed && number === 0) {
  		return ` 0${separator}${UNITS[0]}`;
  	}

  	const isNegative = number < 0;
  	const prefix = isNegative ? '-' : (options.signed ? '+' : '');

  	if (isNegative) {
  		number = -number;
  	}

  	let localeOptions;

  	if (options.minimumFractionDigits !== undefined) {
  		localeOptions = {minimumFractionDigits: options.minimumFractionDigits};
  	}

  	if (options.maximumFractionDigits !== undefined) {
  		localeOptions = {maximumFractionDigits: options.maximumFractionDigits, ...localeOptions};
  	}

  	if (number < 1) {
  		const numberString = toLocaleString(number, options.locale, localeOptions);
  		return prefix + numberString + separator + UNITS[0];
  	}

  	const exponent = Math.min(Math.floor(options.binary ? Math.log(number) / Math.log(1024) : Math.log10(number) / 3), UNITS.length - 1);
  	number /= (options.binary ? 1024 : 1000) ** exponent;

  	if (!localeOptions) {
  		number = number.toPrecision(3);
  	}

  	const numberString = toLocaleString(Number(number), options.locale, localeOptions);

  	const unit = UNITS[exponent];

  	return prefix + numberString + separator + unit;
  }

  var css = "/**\n * Copyright (c) 2024 Anthony Mugendi\n * \n * This software is released under the MIT License.\n * https://opensource.org/licenses/MIT\n */\n\n.scriptin-details {\n  border: 1px solid #eee;\n  padding: 10px;\n  margin: 5px;\n  font-size: 12px;\n  border-radius: 5px;\n}\n\n.scriptin-details h4 {\n  font-size: 14px;\n  margin: 5px 0;\n}\n\n.scriptin-details ul {\n  margin: 0;\n  padding-left: 20px;\n}\n\n.scriptin-details ul li + li {\n  margin-top: 5px;\n  border-top: 1px solid #f0f0f0;\n  padding: 3px 0 0;\n}\n\n.scriptin-details-group + .scriptin-details-group h4 {\n  border-top: 1px solid #eee;\n  margin-top: 10px;\n  padding-top: 10px;\n}\n";

  /**
   * Copyright (c) 2024 Anthony Mugendi
   *
   * This software is released under the MIT License.
   * https://opensource.org/licenses/MIT
   */

  class Plugin {
    constructor(ctx) {
      var _this$options;
      // inherit Scriptin (this.Scriptin) context which we will need
      Object.assign(this, ctx);
      this.dependencies = ['__styler', 'AutoResource'];
      this.pluginOptions = ((_this$options = this.options) === null || _this$options === void 0 || (_this$options = _this$options.plugins) === null || _this$options === void 0 ? void 0 : _this$options.Details) || {};
    }
    init() {
      // Inject styles
      this.Scriptin.injectStyles && this.Scriptin.injectStyles(css);

      // addDetails
      this.addDetails();
    }
    makeFilter() {
      var _filter;
      var filter = this.pluginOptions.filter || null;

      // must be an array
      if (Array.isArray(filter) === false) {
        filter = null;
      }
      if (filter) {
        for (var i in filter) {
          let arr = filter[i].split('.');
          if (arr.length == 1) {
            arr.push(arr[0] + '.*');
          }
          arr.forEach(function (v) {
            if (filter.indexOf(v) == -1) {
              filter.push(v);
            }
          });
        }
      }
      if (((_filter = filter) === null || _filter === void 0 ? void 0 : _filter.length) == 0) {
        filter = null;
      }
      return filter;
    }
    addDetails() {
      var filter = this.makeFilter();
      var showHeaders = this.pluginOptions.showHeaders;
      if (showHeaders == undefined) {
        showHeaders = true;
      }

      // Listen for load event
      this.Scriptin.events.on('loaded', function (script) {
        // log
        if (script.returnType == 'dataURI') {
          var el = document.querySelector('[data-scriptin="' + script.url + '"]');
          if (!el) return;
          var containerEl = document.createElement('div');
          containerEl.setAttribute('class', 'scriptin-details');
          var details = {
            meta: {
              type: script.content.type,
              category: script.content.category,
              size: script.meta.size
            },
            cache: {
              isHot: script.meta.cache.status == '✓'
            },
            file: {
              url: script.url,
              name: script.url.split('/').pop()
            }
          };
          for (var i in details) {
            var key = i;
            if ((filter === null || filter === void 0 ? void 0 : filter.indexOf(key)) == -1) continue;
            var groupEl = document.createElement('div');
            groupEl.setAttribute('class', 'scriptin-details-group');
            var html = '';
            if (showHeaders) {
              html = html + '<h4 class="scriptin-details-category">' + titleCase(i) + '</h4>';
            }
            html = html + '<ul>';
            for (var j in details[i]) {
              var key = i + '.' + j;
              if ((filter === null || filter === void 0 ? void 0 : filter.indexOf(key)) == -1 && (filter === null || filter === void 0 ? void 0 : filter.indexOf(i + '.*')) == -1) continue;
              if (key == 'meta.size') {
                details[i][j] = prettyBytes(details[i][j]);
              }
              html = html + '<li>' + '<strong>' + titleCase(j) + ': </strong> ' + '<span>' + details[i][j] + '</span>' + '</li>';
            }
            html = html + '</ul>';
            groupEl.innerHTML = html;
            containerEl.appendChild(groupEl);
          }

          //   console.log(JSON.stringify(details, 0, 4));
          el.after(containerEl);
        }
      }, {});
    }
  }

  return Plugin;

})();
//# sourceMappingURL=Details.js.map
