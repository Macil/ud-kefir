/* @flow */
//jshint ignore:start

var Kefir = require('kefir');
import {defonce} from 'ud';

export default function udKefir<T>(module: typeof module, value: T, key?:string=''): Kefir.Stream<T> {
  var sharedObject = defonce(module, () => {
    var maybeEmitter;
    var stream = Kefir.stream(_emitter => {
      maybeEmitter = _emitter;
    });
    var property = stream.toProperty();
    // force the property to be active to set and remember its current value.
    property.onValue(()=>{});

    if (!maybeEmitter) throw new Error("Should not happen, emitter was not set");
    var emitter = maybeEmitter;

    return {
      property,
      emit(x) {
        emitter.emit(x);
      }
    };
  }, '--udkefir-'+key);
  sharedObject.emit(value);
  return sharedObject.property;
}
