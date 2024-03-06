/**
 * Copyright (c) 2024 Anthony Mugendi
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

//source: https://github.com/chrisdavies/eev

export default (function () {
    var id = 0;
    var splitter = /[\s,]+/g;
  
    // A relatively generic LinkedList impl
    function LinkedList(linkConstructor) {
      this.head = new RunnableLink();
      this.tail = new RunnableLink(this.head);
      this.head.next = this.tail;
      this.linkConstructor = linkConstructor;
      this.reg = {};
    }
  
    LinkedList.prototype = {
      insert: function (data) {
        var link = new RunnableLink(this.tail.prev, this.tail, data);
        link.next.prev = link.prev.next = link;
        return link;
      },
  
      remove: function (link) {
        link.prev.next = link.next;
        link.next.prev = link.prev;
      }
    };
  
    // A link in the linked list which allows
    // for efficient execution of the callbacks
    function RunnableLink(prev, next, fn) {
      this.prev = prev;
      this.next = next;
      this.fn = fn || noop;
    }
  
    RunnableLink.prototype.run = function (data) {
      this.fn(data);
      this.next && this.next.run(data);
    };
  
    function noop () { }
  
    function Eev () {
      this.events = {};
    }
  
    Eev.prototype = {
      constructor: Eev,
  
      on: function (names, fn) {
        var me = this;
  
        names.split(splitter).forEach(function (name) {
          var list = me.events[name] || (me.events[name] = new LinkedList());
          var eev = fn._eev || (fn._eev = (++id));
  
          list.reg[eev] || (list.reg[eev] = list.insert(fn));
        });
      },
  
      off: function (names, fn) {
        var me = this;
        fn && names.split(splitter).forEach(function (name) {
          var list = me.events[name];
  
          if (!list) {
            return;
          }
  
          var link = list.reg[fn._eev];
  
          list.reg[fn._eev] = undefined;
  
          list && link && list.remove(link);
        });
      },
  
      emit: function (name, data) {
        var evt = this.events[name];
        evt && evt.head.run(data);
      }
    };
  
    return Eev;
  }());