Rotation.js
===========

Responsive and mobile enabled jQuery plugin to help create rotating content such as image carousel, slider or revolving testimonials.

## Main Features

* Quick to setup and configure
* Highly customisable, show/hide components
* Semantic markup, place elements inside list items
* CSS3 transition animations with JavasScript fallback
* Mobile friendly with touch support and mouse fallback
* Keyboard support
* Responsive support

## Usage

Include jQuery as the dependency

```javascript
  <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
```

and then include `jquery.rotation.js` like so

```javascript
  <script src="jquery.rotation.js"></script>
```

and finally add basic stylesheet `jquery.rotation.css`

```
  <link rel="stylesheet" href="jquery.rotation.css">
```

### Markup
Then add semantic markup to describe your content, any item that requires rotation should be placed inside separate list element. For instance, to rotate quotes one can write markup such as

```html
  <div class="rotation-container">
    <ul id="rotator" class="rotation-list">
      <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
      <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
      <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
      ...
    </ul>
  </div>
```
Finally, initialize the **Rotation** plugin

```javascript
  $(".rotation-container").rotate();
```

## Options

There are many options that you can specify for any **Rotation** instance. These options can be provided via constructor or API.

| Option              | Default    | Type   | Description
| -------             | ---------  | ------ | --------
| `autoRotate`        | `true`     | bool   | animate automatically
| `interval`          | `4000`     | int    | rotation interval (ms)
| `duration`          | `500`      | int    | transition speed (ms)
| `itemsId`           | `rotation` | string | id for the main rotation items
| `keypress`          | `true`     | bool   | keyboard keypress navigation
| `touch`             | `true`     | bool   | enable touch events
| `touchMin`          | `30`       | int    | minimum amount of pixels to detect swipe gesture
| `touchMax`          | `320`      | int    | maximum amount of pixels to stop swipe gesture
| `touchDelay`        | `500`      | int    | swipe gesture maximum delay
| `pagination`        | `true`     | bool   | show pagination
| `paginationNumbers` | `true`     | bool   | show pagination with numbers
| `paginationClass`   | `rotation-pagination` | string | top level css class for pagination
| `paginationItemClass` | `item` | string | css class for pagination item
| `paginationCurrentItemClass` | `current`  | string | css class for pagination current item
| `navControls`       | `true`    | bool   | show navigation controls
| `navControlsClass`  | `rotation-nav-controls` | string | top level css class for navigation controls
| `navControlsItemClass` | `item` | string | css class for navigation current item
| `navControlsNextClass` | `next` | string | css class for next nav control
| `navControlsPrevClass` | `prev` | string | css class for prev nav control
| `navControlsNextText`  | `>>`   | string | text for prev nav control
| `navControlsPrevText`  | `<<`   | string | text for prev nav control

### Constructor

```javascript

```
### API

## Events

There are number of custom events emitted by **Rotation** that you can listen for.

| Event         | Description
| -------       | --------
| `swipe`       | when swipe gesture is performed, with swipestart & swipeend custom objects
| `swipeleft`   | when swipe left
| `swiperight`  | when swipe right
| `swipeup`     | when swipe up
| `swipedown`   | when swipe down
| `scrollstart` | when mouse scroll is started
| `scrollstop`  | when mouse scroll is finished
| `play`        | when auto rotation starts/resumes
| `pause`       | when auto rotation pauses
| `stop`        | when auto rotation is stopped

You can either register callback to listen for the custom event with `on` method:

```javascript
    $(".rotation-container").rotate()
    .on("swipeleft", function (e) {
      console.log(e.swipestart.coords);
    })
```

or by passing it to the constructor:

```javascript
    $(".rotation-container").rotate({
      onSwipeLeft: function (e) { ... }
    })
```

## Examples

### 1. Testimonials rotation:

### 2. Image Carousel

### 3. Twitter feed rotation


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Copyright

Copyright (c) 2013 Piotr Murach. See LICENSE for further details.
