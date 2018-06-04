# ud-kefir

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/AgentME/ud-kefir/blob/master/LICENSE.txt) [![npm version](https://img.shields.io/npm/v/ud-kefir.svg?style=flat)](https://www.npmjs.com/package/ud-kefir) [![CircleCI Status](https://circleci.com/gh/AgentME/ud-kefir.svg?style=shield)](https://circleci.com/gh/AgentME/ud-kefir) [![Greenkeeper badge](https://badges.greenkeeper.io/AgentME/ud-kefir.svg)](https://greenkeeper.io/)

A companion utility to [ud](https://github.com/AgentME/ud) for exposing new
values from hot module replacements as
[Kefir](https://rpominov.github.io/kefir/) streams. It's split out from ud only
to avoid making ud require a Kefir peer dependency.

## API

### udKefir(module, value, key?)

This library exposes itself as a single function. Like ud's functions, the
first argument must be a module object, and the last parameter is an optional
key. This function may only be used once per module with a given key. On the
first run, a Kefir property containing the given value will be returned. On
future reloads, the original property will be updated to emit the new value,
and the property will be returned.

Be careful that module replacements do not add new listeners to the property
each time (at least not without old listeners unsubscribing themselves),
because the old listeners still persist.

## Examples

### Value stream

udKefir can be used to keep already constructed resources up-to-date. Here's
an example of udKefir being used to keep a stylesheet set to the latest value
(assuming a transform such as [brfs](https://github.com/substack/brfs) is used
to allow the css file to be bundled).

```javascript
var udKefir = require('ud-kefir');
var fs = require('fs');
var cssContent = udKefir(module, fs.readFileSync(__dirname+'/foo.css', 'utf8'));

function addStylesheet() {
  if (document.getElementById('foo_stylesheet')) {
    throw new Error('Stylesheet was already added');
  }
  var stylesheet = document.createElement('style');
  stylesheet.id = 'foo_stylesheet';
  cssContent.onValue(function(css) {
    stylesheet.textContent = css;
  });
  document.head.appendChild(stylesheet);
}
module.exports = addStylesheet;
```

Whenever the above module is reloaded (because its own file or any of its
dependencies like "foo.css" were updated), the `cssContent` stream emits a new
value.

### Function stream

Say you have this code in a file:

```javascript
var getUserInputStream = require('./get-user-input-stream');
getUserInputStream().log('user input');
```

Now you want to be able to live code your `getUserInputStream` function as you
refine it. You might first reach for ud's `defn` function to define an
updatable function, but it would not help here because `getUserInputStream` is
only called once!

Instead, the solution is to have `getUserInputStream` use flatMapLatest over an
updatable stream of implementation functions, allowing it to switch under the
covers to the latest implementation as soon as a new one is available:

```javascript
// get-user-input-stream.js
var Kefir = require('kefir');
var udKefir = require('ud-kefir');

var implementationStream = udKefir(module, implementation);

function implementation() {
  return Kefir.fromEvents(document.body, 'keydown')
    .map(function(event) {
      switch(event.which) {
        case 37: return 'left';
        case 38: return 'up';
        case 39: return 'right';
        case 40: return 'down';
      }
    })
    .filter(Boolean);
}

function getUserInputStream() {
  return implementationStream.flatMapLatest(function(implementation) {
    return implementation();
  });
}
module.exports = getUserInputStream;
```

Any changes to the `implementation` function, such as to increase the types of
keys it listens to or even to add other events for it to listen to besides
keydown, will be immediately reflected in the running program.

## Types

[Flow](https://flowtype.org/) type declarations for this module are included!
If you are using Flow, they won't require any configuration to use.
