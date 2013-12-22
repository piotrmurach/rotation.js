rotation.js
===========

Responsive and mobile enabled jQuery plugin to help create rotating content.

## Features

* Highly customisable
* Semantic markup
* Responsive support
* Mobile friendly
* CSS3 transition animation

## Setup

Include jQuery as the dependency

```javascript
  <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
```

and then include `jquery.rotation.js` like so

```javascript
  <script src="jquery.rotation.js"></script>
```

Then add semantic markup to describe your content, any item that requires rotation should be placed inside spearte list element. For instance, to rotate quotes one can write markup such as

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
Finally, initialize the rotation plugin by passing options

```javascript
  $("#rotator-container").rotate({
    autoRotate: true,
    paginationNumbers: true
  });
```

## Options

The following are all available options:

| Option       | Default   | Type   | Description
| -------      | --------- | ------ | --------
| `autoRotate` | `true`    | bool   | animate automatically
| `interval`   | `4000`    | int    | rotation interval (ms)
| `duration`   | `500`     | int    | transition speed (ms)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Copyright

Copyright (c) 2013 Piotr Murach. See LICENSE for further details.
