/* @flow */
//jshint ignore:start

var assert = require('assert');
var Kefir = require('kefir');
import udKefir from '../src'

describe("ud-kefir", function() {
  it("works if no module.hot", function(done) {
    var obj = {};
    udKefir(({}:any), obj).onValue(value => {
      assert.strictEqual(value, obj);
      done();
    });
  });
});
