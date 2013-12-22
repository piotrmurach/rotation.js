/*
 * rotation.js
 * 
 */
;(function ($, window, document, undefined) {

  var defaults = {
    // String: default namespace used for classes and events
    namespace: 'rotator',
    // animate automatically
    autoRotate: true,
    // rotator interval (ms)
    interval: 4000,
    // transition speed (ms)
    duration: 500,
    // transition easing
    easing: 'ease',
    // auto rotation pauses on hover
    pauseOnHover: true,
    // auto rotation stops on hover
    stopOnHover: false,
    // mouse scroll content
    scrolling: true,

    // display controls
    pauseControl: true,
    pauseControlContainer: this.namespace + 'play-pause',

    navControls: true,
    // if element exists, the controls get appended
    navControlsClass : 'rotator-nav-controls',
    navControlsNextClass : 'rotator-next',
    navControlsPreviousClass : 'rotator-previous',
    navControlsNextText : 'Next',
    navControlsPreviousText : 'Previous',

    pagination: true,
    paginationNumbers: true,
    paginationClass: 'rotator-pagination',
    paginationItemClass: 'rotator-control',
    paginationCurrentItemClass: 'current',

    itemsId: 'rotator',
    itemsElement: 'li',
    groupItemsBy: 1,

    beforeInit: function () {},
    afterInit: function () {},
    beforeTransition: function () {},
    afterTransition: function () {}
  };

  var Rotator = function (container, options) {
    var self = this;
    // merge defaults
    this.options = $.extend({}, defaults, options);

    this.container      = container;
    this.previousIndex  = 0;
    this.currentIndex   = 0;
    this.itemsContainer = $("#" + this.getOption("itemsId"), this.container);
    this.items          = $(this.getOption("itemsElement"), this.itemsContainer);

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

  Rotator.VERSION = '0.1.0';

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
      var
        element = this.getOption("itemsElement");

      this.initIdsOnElements();

      $(element + ":first", this.container).siblings(element).hide();

      this.bindEvents();
      this.build();
      this.play();
    },

    initIdsOnElements: function () {
      var i;

      for (i = 0; i < this.itemsCount(); i++) {
        this.getItemByIndex(i).attr('id', 'rotator-item-' + i);
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

      // TODO: add more events including swipe
    },

    bindMouseEvents: function () {
      var self = this;

      $(self.container).
        bind("mouseenter", function () {
          self.setOption("autoRotate", false);
        }).
        bind("mouseleave", function () {
          self.setOption("autoRotate", true);
        });
    },

    bindScrolling: function () {
      var self = this;
      $(this.container).bind("mousewheel", function (event) {
        event.preventDefault();
        self.rotate(self.currentIndex+1);
      });
    },


    rotate: function (step, callback) {

      if (this.itemsCount() <= 1) { return; }

      // Stop if user has interacted
      if (!this.getOption("autoRotate")) { return; }

      this.getOption("beforeTransition").call(this);

      var
        currentIndex     = this.currentIndex,
        previousIndex    = this.previousIndex,
        itemsCount       = this.itemsCount() - 1,
        previousElement  = this.getItemByIndex(currentIndex),
        duration         = this.getOption("duration"),
        self             = this;

      // console.log('current index: ' + currentIndex);
      if (currentIndex === itemsCount) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }

      var element = this.getItemByIndex(currentIndex);

      $(previousElement).fadeOut(duration, function () {
        $(element).fadeIn(duration, function () {
          self.currentIndex = currentIndex;
        });
      });

      if (this.getOption("pagination")) {
        var
          currentClass = this.getOption("paginationCurrentItemClass"),
          paginationContainer = $('.'+this.getOption("paginationClass"), this.container),
          nextItem = $("a." + currentClass, paginationContainer).parent('li').next('li'),
          nextPage = nextItem.length ? nextItem.find('a') : $("a:first", paginationContainer);

        $('a.' + currentClass, paginationContainer).removeClass(currentClass);
        nextPage.addClass(currentClass);
      }

      // callbacks
      this.getOption("afterTransition").call(this);
      if (callback && (typeof callback === 'function')) { callback(); }
    },

    play: function () {
      var self = this;

      if (this.getOption("autoRotate")) {
        this.auto = setInterval(function () {
          // self.rotate(0);
          self.rotate(self.currentIndex);
        }, this.getOption("interval"));
      }
    },

    pause: function () {
      var self = this;

      if (self.auto) {
        self.auto = clearInterval(self.auto);
      }
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
      // TODO: build nav controls
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
          'href': '#rotator-item-' + i,
          'data-index': i,
          'text': this.getOption("paginationNumbers") ? i : '',
          'class': this.getOption("paginationItemClass")
        });
        link.appendTo(item);
        item.appendTo(paginationContainer);
      }

      navItems = $('li', paginationContainer).children();
      navItems.eq(0).addClass(this.getOption("paginationCurrentItemClass"));

      navItems.on('click', function (event) {
        event.preventDefault();
        var
          currentElement = $(this),
          pageIndex = currentElement.data('index');

        $(currentElement.attr('href')).show().siblings('li').hide();
        currentElement.addClass(self.getOption("paginationCurrentItemClass")).parent('li').siblings('li').find('a').removeClass('current');

        // reset timer
        self.pause();

        self.currentIndex = pageIndex;
        self.setOption("autoRotate", true);

        self.play();
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
