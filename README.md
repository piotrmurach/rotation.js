Rotation.js <img src="http://benschwarz.github.io/bower-badges/badge@2x.png" width="130" height="30">
===========

Responsive and mobile enabled jQuery plugin to help create rotating content such as image carousel, slider or revolving testimonials.

## Main Features

* Quick to setup
* Highly configurable
* Semantic and minimal markup
* HTML5 Metadata support
* CSS3 transition animations with JavasScript fallback
* Mobile friendly with touch support and mouse fallback
* Accessibility support with ARIA markup
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
<ul id="rotation" class="rotation-list">
  <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
  <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
  <li><blockquote><p>Morbi at odio .... </p></blockquote></li>
  ...
</ul>
```
Finally, initialize the **Rotation** plugin

```javascript
$("#rotation").rotation();
```

## Options

There are many options that you can specify for any **Rotation** instance. These options can be provided via constructor or API.

| Option              | Default    | Type   | Description
| -------             | ---------  | ------ | --------
| `autoRotate`        | `true`     | bool   | animate automatically
| `interval`          | `4000`     | int    | rotation interval (ms)
| `duration`          | `500`      | int    | transition speed (ms)
| `loop`              | `true`     | bool   | infinite scrolling
| `step`              | `1`        | int    | number of items to scroll
| `containerClass`    | `rotation-container` | string | base container css class
| `keypress`          | `true`     | bool   | keyboard keypress navigation
| `touch`             | `true`     | bool   | enable touch events
| `touchMin`          | `30`       | int    | minimum amount of pixels to detect swipe gesture
| `touchMax`          | `320`      | int    | maximum amount of pixels to stop swipe gesture
| `touchDelay`        | `500`      | int    | swipe gesture maximum delay (ms)
| `responsive`        | `true`     | bool   | enable responsive support
| `responsiveDelay`   | `150`      | int    | resize event maximum delay (ms)
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

### Initialization

The wide set of defaults provided by the **Rotation** can be easily extended by using object literal in the following ways:

```javascript
// create instance
var rotation = new Rotation($("#rotation"), {
  autoRotate: true
});

// or set the params on jquery instance
$("#rotation").rotation({
  autoRotate: true
});

// or modify global default params
Rotation.defeaults.autoRotate = true;
```

### API

## Metadata

| Attribute     | Description
| -------       | --------
| `data-init`   | initial params


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
$("#rotation").rotation().
on("swipeleft", function (e) {
  console.log(e.swipestart.coords);
})
```

or by passing it to the constructor:

```javascript
$("#rotation").rotation({
  onSwipeLeft: function (e) { ... }
})
```

## Animation

The **Rotation** uses feature detection to turn CSS3 support in the following browsers:
`Chrome`, `Safari 4+`, `Firefox 4+`, `Android browsers`.

If you want to animate content inside each element use either after/beforeTransition callback
or alternatively css animations.

## Examples

### 1. Testimonials rotation:

### 2. Carousel

### 3. Slider

### 4. Twitter feed rotation


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Copyright

Copyright (c) 2014 Piotr Murach. See LICENSE for further details.
