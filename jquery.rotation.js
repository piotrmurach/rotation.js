/*
 * rotation.js 0.4.3
 *
 * (c) 2014 Piotr Murach
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
    easing: 'linear',
    transitionIn: 'fadeIn',
    transitionOut: 'fadeOut',
    // horizontal or vertical rotation
    orientation: 'horizontal',
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
    // circular rotation
    loop: true,
    visibleItems: 1,
    step: 1,
    itemWidth: 200,
    // eanble responsive support
    responsive: true,
    // resize delay (ms)
    responsiveDelay: 150,
    // main container css
    containerClass: 'rotation-container',

    // display controls
    pausePlayControl: true,
    pausePlayControlClass: 'rotation-play-pause',
    pauseText: 'Pause',
    playText: 'Play',
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
    onInitStart: $.noop,
    onInitEnd: $.noop,
    onTransitionStart: $.noop,
    onTransitionEnd: $.noop,
    onPlay: $.noop,
    onPause: $.noop,
    onSwipeLeft: $.noop,
    onSwipeRight: $.noop,
    onSwipeUp: $.noop,
    onSwipeDown: $.noop,
    onSwipe: $.noop
  };

  var Rotation = function (container, options) {
    var
      self = this, markup, viewport;

    this.options = $.extend({}, defaults, options);

    markup   = $('<section/>', {'class': this.getOption("containerClass")});
    viewport = $('<div/>', {'class': 'rotation-viewport'});

    this._defaults       = defaults;
    this.namespace       = this.options.namespace;
    this.currentIndex    = 0;
    this.isAnimating     = false; // control animation
    this.touchSupported  = 'ontouchend' in document;
    this.itemsContainer  = container;
    this.$itemsContainer = $(this.itemsContainer);
    this.$itemsViewport  = this.$itemsContainer.wrap(viewport).parent();
    this.$items          = this.$itemsContainer.children();
    this.$container      = this.$itemsViewport.wrap(markup).parent();
    this.metadata        = this.$container.data("rotation-options");
    this.cssTransition   = this.hasCSS('transition');
    this.cssTransform    = this.hasCSS('transform');
    this.cssSupported    = !!(this.cssTransition && this.cssTransform);
    this.cssTransEvent   = this.transitionEndEvent();

    // remove whitespace
    this.$items.detach();
    this.$itemsContainer.empty();
    this.$itemsContainer.append(this.$items);

    this.validate();

    this.triggerCustomEvent(this.$itemsContainer, $.Event(self.namespace + ':initstart'));
    this.options.onInitStart.call(this);

    this.init();
    this.build();
    this.bindEvents();
    this.play();

    this.triggerCustomEvent(this.$itemsContainer, $.Event(this.namespace + ':initend'));
    this.options.onInitEnd.call(this);

    // public API
    return {
      // appends item dynamically to container
      add: function (item, callback) {

      },

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

      setCurrent: function (idx, callback) {
        self.currentIndex = idx;
        // self.rotateTo(idx)
        if (callback) { callback.call(); }
      },

      next: function () {
        self.rotate(+self.getOption("step"));
      },

      previous: function () {
        self.rotate(-self.getOption("step"));
      },

      destroy: function () {
        //self.destroy()
      }
    };
  };

  Rotation.VERSION = '0.4.3';

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

    lockAnimation: function () {
      this.isAnimating = true;
    },

    isLocked: function () {
      return !!this.isAnimating;
    },

    unlockAnimation: function () {
      this.isAnimating = false;
    },

    /*
    * Test for css property against vendor specific ones and non-vendor one.
    */
    hasCSS: function (prop) {
      var
        el       = document.createElement('rotation'),
        prefixes = ['Khtml', 'Webkit', 'ms', 'Moz', 'O'],
        lookup   = [''].concat(prefixes).concat(['']),
        capProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
        props    = (prop + ' ' + prefixes.join(capProp + ' ') + capProp).split(' '),
        prefix, i;

      $(document.body).prepend(el);

      for (i in props) {
        prefix = lookup[i].toLowerCase();
        if (prefix !== '') { prefix = '-' + prefix + '-'; }

        if (props[i] in el.style) {
          return prefix + prop;
        }
      }

      $(document.body).children()[0].remove();

      return false;
    },

    /*
    * Test for css transtion end event.
    */
    transitionEndEvent: function () {
      var
        el = document.createElement('rotation'),
        transEndEventNames = {
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition'    : 'transitionend',
          'OTransition'      : 'oTransitionEnd',
          'msTransition'     : 'MSTransitionEnd',
          'transition'       : 'transitionend'
        };

      for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
          return transEndEventNames[name];
        }
      }

      $(document.body).children()[0].remove();

      return false;
    },

    /*
     * Initialize
     */
    init: function () {
      var self = this;

      this.$window       = $(window);
      this.windowHeight  = this.$window.height();
      this.windowWidth   = this.$window.width();
      this.viewportWidth = this.$itemsViewport.outerWidth(true);
      this.viewportHeight = this.$itemsViewport.outerHeight(true);
      this.itemWidth     = this.viewportWidth / this.getOption("visibleItems");
      this.itemHeight    = this.viewportHeight / this.getOption("visibleItems");
      this.itemsWidth    = this.itemWidth * this.itemsCount();
      this.itemsHeight   = this.itemHeight * this.itemsCount();

      this.initIdsOnElements();

      this.$itemsContainer.width(this.itemsWidth);
      this.$items.width(this.itemWidth);
      this.$items.hide();
      var itemsToShow = this.$items.slice(0, this.getOption("visibleItems"));

      $.each(itemsToShow, function (idx, item) {
        $(item).css("left", idx * self.itemWidth).show();
      });
    },

    initIdsOnElements: function () {
      var i;

      for (i = 0; i < this.itemsCount(); i++) {
        this.getItemByIndex(i).addClass('rotation-item-' + (i + 1));
      }
    },

    /*
     * Validate options
     */
    validate: function () {
      var
        responsive  = this.getOption("respnosive"),
        orientation = this.getOption("orientation");

      if (typeof responsive !== 'boolean') {
        this.setOption("responsive", Boolean(responsive));
      }

      if (orientation !== 'horizontal' && orientation !== 'vertical') {
        this.setOption("orientation", 'horizontal');
      }
    },

    /*
     * Bind plugin event listeners
     */
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

    /*
     * Unbind already defiend plugin event listeners
     */
    unbindEvents: function () {
      $(document).off('keydown.' + this.namespace);
      this.$itemsContainer.off('swipeleft swiperight swipeup swipedown .' + this.namespace);
      this.$navContainer.find('a').off('click touchstart .' + this.namespace);
      this.$paginationContainer.find('a').off('click touchstart .' + this.namespace);
    },

    bindResizeEvent: function () {
      var self = this,
          timer;

      self.$window.on("resize." + this.namespace, function (e) {
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

      $(document).on('keydown.' + this.namespace, function (e) {
        // next or up
        if (e.keyCode === 39 || e.keyCode === 38) {
          self.rotate(+self.getOption("step"));
        }
        // prev or down
        if (e.keyCode === 37 || e.keyCode === 40) {
          self.rotate(-self.getOption("step"));
        }
      });
    },

    bindMouseEvents: function () {
      var self = this;

      this.$itemsContainer.
        on("mouseenter." + this.namespace, function () {
          self.setOption("pause", true);
        }).
        on("mouseleave." + this.namespace, function () {
          self.setOption("pause", false);
        });
    },

    bindScrolling: function () {
      var self = this;

      this.$itemsContainer.on("mousewheel." + this.namespace, function (e) {
        e.preventDefault();
        self.rotate(self.currentIndex + self.getOption("step"));
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
        namespace  = self.getOption("namespace"),
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

            var events = [namespace + ':swipe'];

            if (touchDeltaX >= touchMin && touchDeltaY < touchMin) {
              self.setOption("pause", false);

              if (touchStart.coords[0] > touchEnd.coords[0]) {
                events.push(namespace + ":swipeleft");
                self.rotate(-self.getOption("step"));
                self.getOption('onSwipeLeft').call(self);
              } else {
                events.push(namespace + ":swiperight");
                self.rotate(+self.getOption("step"));
                self.getOption('onSwipeRight').call(self);
              }
            } else if(touchDeltaY >= touchMin && touchDeltaX < touchMin) {
              self.setOption("pause", false);

              if (touchStart.coords[1] < touchEnd.coords[1]) {
                events.push(namespace + ":swipedown");
                self.rotate(-self.getOption("step"));
                self.getOption('onSwipeDown').call(self);
              } else {
                events.push(namespace + ":swipeup");
                self.rotate(+self.getOption("step"));
                self.getOption('onSwipeUp').call(self);
              }
            }

            $.each(events, function (index, eventName) {
              var eventObject = $.Event(eventName, {
                target: e.target,
                swipestart: touchStart,
                swipeend: touchEnd,
              });
              self.triggerCustomEvent(self.$itemsContainer, eventObject);
            });
          }
        };

      self.$itemsContainer
        .on(touchStartEvent + '.' + this.namespace, onTouchStart)
        .on(touchMoveEvent  + '.' + this.namespace, onTouchMove)
        .on(touchStopEvent  + '.' + this.namespace, onTouchEnd);
    },

    /*
     * Main content rotation.
     */
    rotate: function (direction, callback) {
      // nothing to rotate
      if (this.itemsCount() <= 1) { return; }

      // Pause if user has interacted
      if (this.getOption("pause")) { return; }

      if (direction) { this.pause(); }


      var
        namespace       = this.getOption("namespace"),
        currentIndex    = this.currentIndex,
        itemsCount      = this.itemsCount(),
        previousElement = this.getItemByIndex(currentIndex),
        dimension, element, distance;

      dimension = this.getOption("orientation") === 'horizontal' ? this.itemWidth : this.itemHeight;

      if (currentIndex === 0 && direction < 0) {
        currentIndex = itemsCount - 1;
      } else {
        currentIndex = (direction ? currentIndex + direction : ++currentIndex) % itemsCount;
      }

      element = this.getItemByIndex(currentIndex);
      distance = direction ? direction * dimension : dimension;

      this.$itemsContainer.stop();

      if (this.isLocked()) { return; }

      this.lockAnimation();

      this.getOption("onTransitionStart").call(this);
      this.triggerCustomEvent(this.$itemsContainer, $.Event(namespace + ':transitionstart'));

      this.animations.slide.call(this, previousElement, element, distance, currentIndex);

      if (this.getOption("pagination")) {
        this.setPaginationCurrentItem(direction);
      }

      // callbacks
      if (callback && (typeof callback === 'function')) { callback(); }

      if (direction) { this.play(); }
    },

    animations: {
      slide: function(previousElement, element, distance, currentIndex) {
        var
          self = this,
          duration    = this.getOption("duration"),
          easing      = this.getOption("easing"),
          orientation = this.getOption("orientation"),
          namespace   = this.getOption("namespace"),
          promises    = [];

        if (orientation === 'horizontal') {
          promises.push(
            $(previousElement).css({left: 0})
            .animate({left: -distance}, {duration: duration, easing: easing}).promise()
          );

          promises.push(
            $(element).css({left: distance}).show()
            .animate({left: 0},{duration: duration, easing: easing}).promise()
          );
        } else {
          promises.push(
            $(previousElement).css({top: 0})
            .animate({top: -distance}, {duration: duration}).promise()
          );

          promises.push(
            $(element).css({top: distance}).show()
            .animate({top: 0},{duration: duration}).promise()
          );
        }

        $.when.apply(null, promises).done(function () {
          self.currentIndex = currentIndex;
          self.unlockAnimation();
          self.getOption("onTransitionEnd").call(self);
          self.triggerCustomEvent(self.$itemsContainer, $.Event(namespace + ':transitionend'));
        });
      }
    },

    play: function () {
      var self = this,
          namespace = self.getOption("namespace");

      if (this.getOption("autoRotate")) {
        this.auto = setInterval(function () {
          self.rotate();
        }, this.getOption("interval"));
        this.getOption("onPlay").call(this);
        self.triggerCustomEvent(self.$itemsContainer, $.Event(namespace + ':play'));
      }
    },

    pause: function () {
      var self = this,
          namespace = self.getOption("namespace");

      if (self.auto) {
        self.auto = clearInterval(self.auto);
      }
      this.getOption("onPause").call(this);
      self.triggerCustomEvent(self.$itemsContainer, $.Event(namespace + ':pause'));
    },

    setPaginationCurrentItem: function (direction) {
      var
        currentClass        = this.getOption("paginationCurrentItemClass"),
        currentItem         = $("a." + currentClass, this.$paginationContainer).parent('li'),
        nextIndex, nextItem, nextPage, selector;

      selector = direction < 0 ? "last" : "first";
      if (direction) {
        nextIndex = direction < 0 ? this.currentIndex + direction : this.currentIndex + direction - 1;
      } else {
        nextIndex = this.currentIndex;
      }
      nextItem = currentItem.siblings().eq(nextIndex);
      nextPage = nextItem.length ? nextItem.find('a') : $("a:" + selector, this.$paginationContainer);

      $('a.' + currentClass, this.$paginationContainer).removeClass(currentClass);
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
          startEvents = 'click touchstart .' + this.namespace,
          item;

      self.$navContainer = $('<ul/>', {'class': this.getOption("navControlsClass")});
      $('<nav/>').wrapInner(self.$navContainer).appendTo(container);

      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsPrevClass"),
        'data-direction': -this.getOption("step"),
        'html': this.getOption("navControlsPrevText")
      });
      $('<li/>').wrapInner(item).appendTo(self.$navContainer);
      item = $('<a/>', {
        'href': '#',
        'class': this.getOption("navControlsItemClass") + ' ' + this.getOption("navControlsNextClass"),
        'data-direction': +this.getOption("step"),
        'html': this.getOption("navControlsNextText")
      });
      $('<li/>').wrapInner(item).appendTo(self.$navContainer);


      self.$navContainer.children().find('a').on(startEvents, function (e) {
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
        startEvents = 'click touchstart .' + this.namespace,
        item, link, i, navItems;

      self.$paginationContainer = $('<ol/>', {
        'class': this.getOption("paginationClass"),
        'role': 'navigation',
        'aria-labelledby': 'paginglabel'
      });
      self.$paginationContainer.appendTo(container);

      for (i = 0; i < this.itemsCount(); i++) {
        item = $('<li/>');
        link = $('<a/>', {
          'href': '#rotation-item-' + i,
          'data-index': i,
          'text': this.getOption("paginationNumbers") ? i+1 : '',
          'class': this.getOption("paginationItemClass")
        });
        link.appendTo(item);
        item.appendTo(self.$paginationContainer);
      }

      navItems = $('li', self.$paginationContainer).children();
      navItems.eq(0).addClass(this.getOption("paginationCurrentItemClass"));

      navItems.on(startEvents, function (e) {
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

  /*
   * logger
   */
  function log() {
    if (window.console && console.log) {
      console.log(name + ' : ' + Array.prototype.join.call(arguments, ' '));
    }
  };

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
