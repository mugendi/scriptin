/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { titleCase } from '../lib/utils/general';
import css from '../styles/details.css';

export default class Plugin {
  constructor(ctx) {
    // inherit Scriptin (this.Scriptin) context which we will need
    Object.assign(this, ctx);

    this.dependencies = ['__styler'];
  }

  init() {
    // Inject styles
    this.Scriptin.injectStyles(css);
    // addDetails
    this.addDetails();
  }

  makeFilter() {
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
        // console.log(arr);
        arr.forEach((v) => {
          if (filter.indexOf(v) == -1) {
            filter.push(v);
          }
        });
      }
    }

    if (filter?.length == 0) {
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
    this.Scriptin.events.on(
      'loaded',
      function (script) {
        // log
        if (script.returnType == 'dataURI') {
          var el = document.querySelector(
            '[data-scriptin="' + script.url + '"]'
          );
          if (!el) return;

          var containerEl = document.createElement('div');
          containerEl.setAttribute('class', 'scriptin-details');

          var details = {
            meta: {
              type: script.content.type,
              category: script.content.category,
              size: script.meta.size,
            },
            cache: {
              isHot: script.meta.cache.status == '✓',
            },
            file: {
              url: script.url,
              name: script.url.split('/').pop(),
            },
          };

          for (var i in details) {
            var key = i;

            if (filter?.indexOf(key) == -1) continue;

            var groupEl = document.createElement('div');

            groupEl.setAttribute('class', 'scriptin-details-group');

            var html = '';

            if (showHeaders) {
              html =
                html +
                '<h4 class="scriptin-details-category">' +
                titleCase(i) +
                '</h4>';
            }

            html = html + '<ul>';

            for (var j in details[i]) {
              var key = i + '.' + j;

              if (filter?.indexOf(key) == -1 && filter?.indexOf(i + '.*') == -1)
                continue;

              html =
                html +
                '<li>' +
                '<strong>' +
                titleCase(j) +
                ': </strong> ' +
                '<span>' +
                details[i][j] +
                '</span>' +
                '</li>';
            }

            html = html + '</ul>';

            groupEl.innerHTML = html;

            containerEl.appendChild(groupEl);
          }

          //   console.log(JSON.stringify(details, 0, 4));
          el.after(containerEl);
        }
      },
      {}
    );
  }
}
