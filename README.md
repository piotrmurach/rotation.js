rotation.js
===========

Responsive and mobile enabled jQuery plugin to help create rotating content such as image carousel, slider or revolving testimonials.

## Main Features

* Quick to setup and configure
* Highly customisable, show/hide components
* Semantic markup, place elements inside list items
* CSS3 transition animations with JavasScript fallback
* Mobile friendly
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

Then add semantic markup to describe your content, any item that requires rotation should be placed inside separate list element. For instance, to rotate quotes one can write markup such as

```html
  <div id="rotator-container">
    <ul id="rotator">
      <li>
        <blockquote>
          <p>Morbi at odio .... </p>
          <div class="author">Piotr Murach</div>
        </blockquote>
      </li>
      ...
    </ul>
  </div>
```
Finally, initialise the rotation plugin by passing options

```javascript
  $("#rotator-container").rotate({
    autoRotate: true,
    paginationNumbers: true
  });
```

## Examples

1. Testimonials rotation:

2. Image Carousel

3. Twitter feed rotation

## Options

The following are all available options:

| Option              | Default    | Type   | Description
| -------             | ---------  | ------ | --------
| `autoRotate`        | `true`     | bool   | animate automatically
| `interval`          | `4000`     | int    | rotation interval (ms)
| `duration`          | `500`      | int    | transition speed (ms)
| `itemsId`           | `rotation` | string | id for the main rotation items
| `itemsElement`      | `li`       | string | html markup for a rotation item
| `keypress`          | `true`     | bool   | keyboard keypress navigation
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

## API


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Copyright

Copyright (c) 2013 Piotr Murach. See LICENSE for further details.
