/* @flow */
//jshint ignore:start

var assert = require('assert');
var sinon = require('sinon');
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

  it("works over two reloads", function() {
    var _module1: any = {
      hot: {
        data: null,
        accept: sinon.spy(),
        dispose: sinon.spy()
      }
    };
    var obj1 = {};
    var stream = udKefir(_module1, obj1);
    var valueSpy = sinon.spy();
    stream.onValue(valueSpy);
    assert.strictEqual(valueSpy.callCount, 1);
    assert.strictEqual(valueSpy.getCall(0).args[0], obj1);

    var hotData1 = {};
    _module1.hot.dispose.getCalls().forEach(call => {
      call.args[0].call(null, hotData1);
    });
    _module1 = null; // make sure we don't accidentally re-use this

    var _module2: any = {
      hot: {
        data: hotData1,
        accept: sinon.spy(),
        dispose: sinon.spy()
      }
    };
    var obj2 = {};
    assert.strictEqual(udKefir(_module2, obj2), stream);
    assert.strictEqual(valueSpy.callCount, 2);
    assert.strictEqual(valueSpy.getCall(1).args[0], obj2);

    var hotData2 = {};
    _module2.hot.dispose.getCalls().forEach(call => {
      call.args[0].call(null, hotData2);
    });
    _module2 = null;

    var _module3: any = {
      hot: {
        data: hotData2,
        accept: sinon.spy(),
        dispose: sinon.spy()
      }
    };
    var obj3 = {};
    assert.strictEqual(udKefir(_module3, obj3), stream);
    assert.strictEqual(valueSpy.callCount, 3);
    assert.strictEqual(valueSpy.getCall(2).args[0], obj3);
  });
});
