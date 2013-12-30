/*
 * rotation.js 0.2.0
 *
 * (c) 2013 Piotr Murach
 *
 * Creates rotation of elements with various transition events.
 */
;(function ($, window, document, undefined) {
  'use strict';

  var defaults = {
    // String: default namespace used for classes and events
    namespace: 'rotation',
    // animate automatically
    autoRotate: true,
    // rotation interval (ms)
    interval: 3000,
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
    //minimum amount of pixels for swipe gesture
    touchMin: 30,
    //maximum amount of pixels for swipe gesture
    touchMax: 320,
    // main rotation id
    itemsId: 'rotation',
    visibleItems: 1,
    scrollingStep: 1,
    // display controls
    pauseControl: true,
    pauseControlContainer: 'rotation-play-pause',
    // navigation control arrows
    navControls          : true,
    navControlsClass     : 'rotation-nav-controls',
    navControlsItemClass : 'item',
    navControlsNextClass : 'next',
    navControlsPrevClass : 'prev',
    navControlsNextText  : '>>',
    navControlsPrevText  : '<<',
    // pagination controls
    pagination: true,
    paginationNumbers: true,
    paginationClass: 'rotation-pagination',
    paginationItemClass: 'item',
    paginationCurrentItemClass: 'current',
    // callbacks
    beforeInit: function () {},
    afterInit: function () {},
    beforeTransition: function () {},
    afterTransition: function () {},
    swipeLeft: function (e) {},
    swipeRight: function (e) {},
    swipeMove: function (e) {}
  };

  var Rotator = function (container, options) {
    var self = this;
    // merge defaults
    this.options = $.extend({}, defaults, options);

    this.container      = container;
    this.currentIndex   = 0;
    this.itemsContainer = $("#" + this.getOption("itemsId"), this.container);
    this.items          = $(this.itemsContainer).children();
    this.touchSupported = 'ontouchend' in document;

    this.options.beforeInit.call(this);

    this.init();

    this.options.afterInit.call(this);

    return {
      play: function () {
        self.play();
      },

      pause: function () {
        self.pause();
      }
    };
  };

  Rotator.VERSION = '0.3.0';

  $.extend(Rotator.prototype, {

    getOption: function (option) {
      return this.options[option];
    },

    setOption: function (option, value) {
      this.options[option] = value;
      return value;
    },

    itemsCount: function () {
      return this.items.length;
    },

    getItemByIndex: function (index) {
      return this.items.eq(index);
    },

    init: function () {
      this.itemWidth  = this.itemsContainer.width();
      this.initIdsOnElements();

      this.items.eq(0).siblings().hide();

      this.bindEvents();
      this.build();
      this.play();
    },

    initIdsOnElements: function () {
      var i;

      for (i = 0; i < this.itemsCount(); i++) {
        this.getItemByIndex(i).attr('id', 'rotation-item-' + i);
      }
    },

    bindEvents: function () {
      var self = this;

      $(window).on("resize", function () {
        /* self.init();
        self.rotate(0); */
      });

      if (this.getOption("pauseOnHover")) {
        self.bindMouseEvents();
      }

      if (this.getOption("scrolling")) {
        self.bindScrolling();
      }

      if (this.getOption("keypress")) {
        this.bindKeyboardEvents();
      }

      if (this.getOption("touch")) {
        this.bindTouchEvents();
      }
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

      this.itemsContainer.
        on("mouseenter", function () {
          self.setOption("autoRotate", false);
        }).
        on("mouseleave", function () {
          self.setOption("autoRotate", true);
        });
    },

    bindScrolling: function () {
      var self = this;

      this.itemsContainer.on("mousewheel", function (e) {
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
          }
        };

      self.itemsContainer
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

      this.getOption("beforeTransition").call(this);

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

      self.itemsContainer.stop();

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
      this.getOption("afterTransition").call(this);
      if (callback && (typeof callback === 'function')) { callback(); }

      if (direction) { this.play(); }
    },

    play: function () {
      var self = this;

      if (this.getOption("autoRotate")) {
        this.auto = setInterval(function () {
          self.rotate();
        }, this.getOption("interval"));
      }
    },

    pause: function () {
      var self = this;

      if (self.auto) {
        self.auto = clearInterval(self.auto);
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
          container = this.container,
          navContainer, item;

      navContainer = $('<div/>', {
        'class': this.getOption("navControlsClass")
      });
      navContainer.appendTo(container);

      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsPrevClass"),
        'data-direction': -1,
        'html': this.getOption("navControlsPrevText")
      });
      item.appendTo(navContainer);
      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsNextClass"),
        'data-direction': 1,
        'html': this.getOption("navControlsNextText")
      });
      item.appendTo(navContainer);

      navContainer.children().on('click', function (e) {
        e.preventDefault();
        var direction = +$(this).data('direction');

        self.setOption("autoRotate", true);
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
        container = this.container,
        paginationContainer, item, link, i, navItems;

      paginationContainer = $('<ul/>', {'class': this.getOption("paginationClass")});
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

        self.setOption("autoRotate", true);
        self.rotate(direction);
      });
    }

  });

  $.fn.rotate = function (options) {
    return this.each(function () {
      var container = $(this);

      new Rotator(container, options);
    });
  };

})(jQuery, window, document);
