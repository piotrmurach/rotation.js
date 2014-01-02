/*
 * rotation.js 0.4.0
 *
 * (c) 2013 Piotr Murach
 *
 * Creates rotation of elements with various transition events.
 */
;(function ($, window, document, undefined) {
  'use strict';

  var
    name = 'rotation',
    defaults = {
    // String: default namespace used for classes and events
    namespace: 'rotation',
    // animate automatically
    autoRotate: true,
    // rotation interval (ms)
    interval: 4000,
    // transition speed (ms)
    duration: 300,
    // transition easing
    transitionIn: 'fadeIn',
    transitionOut: 'fadeOut',
    // auto rotation pauses on hover
    pauseOnHover: true,
    // auto rotation stops on hover
    stopOnHover: false,
    // mouse scroll content
    scrolling: true,
    // enable keyboard events
    keypress: true,
    // enable touch events
    touch: true,
    // it isn't a swipe over this time
    touchDelay: 500,
    // minimum amount of pixels for swipe gesture
    touchMin: 30,
    // maximum amount of pixels for swipe gesture
    touchMax: 320,
    visibleItems: 1,
    scrollingStep: 1,
    // eanble responsive support
    responsive: true,
    // resize delay (ms)
    responsiveDelay: 150,
    // main container css
    containerClass: 'rotation-container',
    // display controls
    pauseControl: true,
    pauseControlContainer: 'rotation-play-pause',
    // navigation control arrows
    navControls          : true,
    navControlsClass     : 'rotation-nav-controls',
    navControlsItemClass : 'rotation-item',
    navControlsNextClass : 'rotation-next',
    navControlsPrevClass : 'rotation-prev',
    navControlsNextText  : '>>',
    navControlsPrevText  : '<<',
    // pagination controls
    pagination: true,
    paginationNumbers: true,
    paginationClass: 'rotation-pagination',
    paginationItemClass: 'rotation-page',
    paginationCurrentItemClass: 'current',
    // callbacks
    beforeInit: $.noop,
    afterInit: $.noop,
    beforeTransition: $.noop,
    afterTransition: $.noop,
    onSwipeLeft: $.noop,
    onSwipeRight: $.noop,
    onSwipeUp: $.noop,
    onSwipeDown: $.noop,
    onSwipe: $.noop
  };

  var Rotation = function (container, options) {
    var
      self = this, markup;

    this.options = $.extend({}, defaults, options);

    markup = $('<section/>', {'class': this.getOption("containerClass")});

    this._defaults       = defaults;
    this._name           = name;
    this.currentIndex    = 0;
    this.isAnimating     = false; // control animation
    this.touchSupported  = 'ontouchend' in document;
    this.itemsContainer  = container;
    this.$itemsContainer = $(this.itemsContainer);
    this.$items          = this.$itemsContainer.children();
    this.$container      = this.$itemsContainer.wrap(markup).parent();
    this.metadata        = this.$container.data("rotation-options");

    // remove whitespace
    this.$items.detach();
    this.$itemsContainer.empty();
    this.$itemsContainer.append(this.$items);

    this.options.beforeInit.call(this);

    this.init();
    this.build();
    this.bindEvents();
    this.play();

    this.options.afterInit.call(this);

    // public API
    return {
      play: function () {
        self.play();
      },

      pause: function () {
        self.pause();
      },

      itemsCount: function () {
        return self.itemsCount();
      },

      current: function () {
        return self.currentIndex;
      },

      next: function () {
        self.rotate(1);
      },

      previous: function () {
        self.rotate(-1);
      }
    };
  };

  Rotation.VERSION = '0.4.0';

  $.extend(Rotation.prototype, {

    getOption: function (option) {
      return this.options[option];
    },

    setOption: function (option, value) {
      this.options[option] = value;
      return value;
    },

    triggerCustomEvent: function (obj, event) {
      obj.trigger(event);
    },

    itemsCount: function () {
      return this.$items.length;
    },

    getItemByIndex: function (index) {
      return this.$items.eq(index);
    },

    /*
     * Initialize
     */
    init: function () {
      this.$window      = $(window);
      this.windowHeight = this.$window.height();
      this.windowWidth  = this.$window.width();
      this.itemWidth    = this.$itemsContainer.width();
      this.initIdsOnElements();

      this.$items.eq(0).siblings().hide();
    },

    initIdsOnElements: function () {
      var i;

      for (i = 0; i < this.itemsCount(); i++) {
        this.getItemByIndex(i).addClass('rotation-item-' + (i + 1));
      }
    },

    bindEvents: function () {

      if (this.getOption("responsive")) {
        this.bindResizeEvent();
      }

      if (this.getOption("pauseOnHover")) {
        this.bindMouseEvents();
      }

      if (this.getOption("scrolling")) {
        this.bindScrolling();
      }

      if (this.getOption("keypress")) {
        this.bindKeyboardEvents();
      }

      if (this.getOption("touch")) {
        this.bindTouchEvents();
      }
    },

    bindResizeEvent: function () {
      var self = this,
          timer;

      self.$window.on("resize", function (e) {
        if (e.originalEvent) {
          var width = self.$window.width(),
              height = self.$window.height();

          if (width !== self.windowWidth || height !== self.windowHeight) {
            self.windowWidth = width;
            self.windowHeight = height;
            clearTimeout(timer);
            timer = setTimeout(function () {
              self.init();
              self.rotate(0);
            }, self.getOption("responsiveDelay"));
          }
        }
      });
    },

    bindKeyboardEvents: function () {
      var self = this;

      $(document).on('keydown', function (e) {
        // next
        if (e.keyCode === 39) {
          self.rotate(1);
        }
        // prev
        if (e.keyCode === 37) {
          self.rotate(-1);
        }
      });
    },

    bindMouseEvents: function () {
      var self = this;

      this.$itemsContainer.
        on("mouseenter", function () {
          self.setOption("autoRotate", false);
        }).
        on("mouseleave", function () {
          self.setOption("autoRotate", true);
        });
    },

    bindScrolling: function () {
      var self = this;

      this.$itemsContainer.on("mousewheel", function (e) {
        e.preventDefault();
        self.rotate(self.currentIndex+1);
      });
    },

    /*
     * Move elemnts on swipe.
     */
    bindTouchEvents: function () {
      var
        self = this,
        elapsedTime,
        touchStart,
        touchEnd,
        touchDistance,
        touchDeltaX,
        touchDeltaY,
        touchDelay = self.getOption("touchDelay"),
        touchMin   = self.getOption("touchMin"),
        touchMax   = self.getOption("touchMax"),
        touchStartEvent = self.touchSupported ? 'touchstart' : 'mousedown',
        touchStopEvent  = self.touchSupported ? 'touchend' : 'mouseout',
        touchMoveEvent  = self.touchSupported ? 'touchmove' : 'mousemove',

        chooseTouchEvent = function (e) {
          if (e.pageX) { return e; }
          return e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        },

        createTouch = function (e) {
          var touch = chooseTouchEvent(e);
          return {
            time:   new Date().getTime(),
            touch:  touch,
            coords: [touch.pageX, touch.pageY],
            origin: $(e.target)
          };
        },

        onTouchStart = function (e)  {
          e.preventDefault();

          touchStart = createTouch(e);
        },

        onTouchMove = function (e) {
          if (!touchStart) {
            return;
          }

          touchEnd = createTouch(e);

          // prevent scrolling
          if (Math.abs(touchStart.coords[0] - touchEnd.coords[0]) > 10) {
            e.preventDefault();
          }
        },

        onTouchEnd = function (e) {
          e.preventDefault();

          if (!touchStart || !touchEnd) {
            return;
          }

          elapsedTime   = touchEnd.time - touchStart.time;
          touchDeltaX   = Math.abs(touchStart.coords[0] - touchEnd.coords[0]);
          touchDeltaY   = Math.abs(touchStart.coords[1] - touchEnd.coords[1]);
          touchDistance = Math.sqrt(touchDeltaX * touchDeltaX + touchDeltaY * touchDeltaY);

          // moved less than 15 pixels and touch duration is less than 100ms
          // trigger tap event on the element
          if (touchDistance < 15 && elapsedTime < 100)  {
            touchStart.origin.trigger('click');
            return;
          }

          if (elapsedTime < touchDelay &&
              touchDistance >= touchMin &&
              touchDistance <= touchMax) {

            var events = ['swipe'];

            if (touchDeltaX >= touchMin && touchDeltaY < touchMin) {
              if (touchStart.coords[0] > touchEnd.coords[0]) {
                events.push("swipeleft");
                self.rotate(-1);
              } else {
                events.push("swiperight");
                self.rotate(1);
              }
            } else if(touchDeltaY >= touchMin && touchDeltaX < touchMin) {
              if (touchStart.coords[1] < touchEnd.coords[1]) {
                events.push("swipedown");
              } else {
                events.push("swipeup");
              }
            }

            $.each(events, function (index, eventType) {
              var eventObject = $.Event(eventType, {
                target: e.target,
                swipestart: touchStart,
                swipeend: touchEnd,
              });
              self.triggerCustomEvent(self.$itemsContainer, eventObject);
            });
          }
        };

      self.$itemsContainer
        .on(touchStartEvent, onTouchStart)
        .on(touchMoveEvent, onTouchMove)
        .on(touchStopEvent, onTouchEnd);
    },

    /*
     * Main content rotation.
     */
    rotate: function (direction, callback) {
      // nothing to rotate
      if (this.itemsCount() <= 1) { return; }

      // Stop if user has interacted
      if (!this.getOption("autoRotate")) { return; }

      if (direction) { this.pause(); }

      this.getOption("beforeTransition").call(this, this.currentIndex);

      var
        currentIndex     = this.currentIndex,
        itemsCount       = this.itemsCount(),
        previousElement  = this.getItemByIndex(currentIndex),
        duration         = this.getOption("duration"),
        self             = this,
        element, distance;

      if (currentIndex === 0 && direction < 0) {
        currentIndex = itemsCount - 1;
      } else {
        currentIndex = (direction ? currentIndex + direction : ++currentIndex) % itemsCount;
      }
      // console.log('current index: ' + currentIndex);

      element = this.getItemByIndex(currentIndex);
      distance = direction ? direction * self.itemWidth : self.itemWidth;

      self.$itemsContainer.stop();

      $.when(
        $(previousElement).css({
            'margin-left': '0px', 'opacity': 1
           }).animate({
          'margin-left': distance < 0 ? distance : -distance + 'px',
          'opacity': 0}, {
           duration: duration,
           complete: function () {
             $(element).css({
               'zIndex': 10,
               'opacity': 0,
               'margin-left': distance < 0 ? -distance : distance + 'px'
             }).show().animate({
              'margin-left': '0px', 'opacity': 1}, {
              duration: duration,
             });
           }
        })

      ).done(function () {
        self.currentIndex = currentIndex;
      });

      if (this.getOption("pagination")) {
        this.setPaginationCurrentItem(direction);
      }

      // callbacks
      this.getOption("afterTransition").call(this, this.currentIndex);
      if (callback && (typeof callback === 'function')) { callback(); }

      if (direction) { this.play(); }
    },

    play: function () {
      var self = this;

      if (this.getOption("autoRotate")) {
        this.auto = setInterval(function () {
          self.rotate();
        }, this.getOption("interval"));
        self.triggerCustomEvent(self.$itemsContainer, $.Event('play'));
      }
    },

    pause: function () {
      var self = this;

      if (self.auto) {
        self.auto = clearInterval(self.auto);
        self.triggerCustomEvent(self.$itemsContainer, $.Event('pause'));
      }
    },

    setPaginationCurrentItem: function (direction) {
      var
        currentClass        = this.getOption("paginationCurrentItemClass"),
        paginationContainer = $('.'+this.getOption("paginationClass"), this.container),
        currentItem         = $("a." + currentClass, paginationContainer).parent('li'),
        nextIndex, nextItem, nextPage, selector;

      selector = direction < 0 ? "last" : "first";
      if (direction) {
        nextIndex = direction < 0 ? this.currentIndex + direction : this.currentIndex + direction - 1;
      } else {
        nextIndex = this.currentIndex;
      }
      nextItem = currentItem.siblings().eq(nextIndex);
      nextPage = nextItem.length ? nextItem.find('a') : $("a:" + selector, paginationContainer);

      $('a.' + currentClass, paginationContainer).removeClass(currentClass);
      nextPage.addClass(currentClass);
    },

    /*
     * Build UI in DOM
     */
    build: function () {
      if (this.getOption("navControls")) {
        this.buildNavControls();
      }

      if (this.getOption("pagination")) {
        this.buildPagination();
      }
    },

    /*
     * Builds rotator navigation.
     */
    buildNavControls: function () {
      if (this.itemsCount() <= 1) { return; }

      var self = this,
          container = this.$container,
          navContainer, item;

      navContainer = $('<ul/>', {'class': this.getOption("navControlsClass")});
      $('<nav/>').wrapInner(navContainer).appendTo(container);

      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsPrevClass"),
        'data-direction': -1,
        'html': this.getOption("navControlsPrevText")
      });
      $('<li/>').wrapInner(item).appendTo(navContainer);
      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsNextClass"),
        'data-direction': 1,
        'html': this.getOption("navControlsNextText")
      });
      $('<li/>').wrapInner(item).appendTo(navContainer);

      navContainer.children().on('click', function (e) {
        e.preventDefault();
        var direction = +$(this).data('direction');

        self.rotate(direction);
      });
    },

    /*
     * Builds rotator pagination.
     */
    buildPagination: function () {

      if (this.itemsCount() <= 1) { return; }

      var
        self = this,
        container = this.$container,
        paginationContainer, item, link, i, navItems;

      paginationContainer = $('<ol/>', {
        'class': this.getOption("paginationClass"),
        'role': 'navigation',
        'aria-labelledby': 'paginglabel'
      });
      paginationContainer.appendTo(container);

      for (i = 0; i < this.itemsCount(); i++) {
        item = $('<li/>');
        link = $('<a/>', {
          'href': '#rotation-item-' + i,
          'data-index': i,
          'text': this.getOption("paginationNumbers") ? i+1 : '',
          'class': this.getOption("paginationItemClass")
        });
        link.appendTo(item);
        item.appendTo(paginationContainer);
      }

      navItems = $('li', paginationContainer).children();
      navItems.eq(0).addClass(this.getOption("paginationCurrentItemClass"));

      navItems.on('click touchstart', function (e) {
        e.preventDefault();
        var
          currentElement = $(this),
          currentClass   = self.getOption("paginationCurrentItemClass"),
          pageIndex      = +currentElement.data('index'),
          direction, currentIndex;

        currentIndex = +currentElement.
          parent('li').siblings('li').find('a.'+currentClass).data('index');
        direction =  pageIndex - currentIndex;

        self.rotate(direction);
      });
    }

  });

  Rotation.defaults = Rotation.prototype.defaults;

  $.fn[name] = function (options) {
    return this.each(function () {
      var container = this,
          instance = $.data(container, name);

      if (!instance) {
        $.data(container, name, new Rotation(container, options));
      }
    });
  };

  window.Rotation = Rotation;

})(jQuery, window, document);
