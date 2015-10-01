/* @flow */
//jshint ignore:start

const Kefir = require('kefir');
import {defonce} from 'ud';

export default function udKefir<T>(module: typeof module, value: T, key?:string=''): Kefir.Stream<T> {
  const sharedObject = defonce(module, () => {
    let maybeEmitter;
    const stream = Kefir.stream(_emitter => {
      maybeEmitter = _emitter;
    });
    const property = stream.toProperty();
    // force the property to be active to set and remember its current value.
    property.onValue(()=>{});

    if (!maybeEmitter) throw new Error("Should not happen, emitter was not set");
    const emitter = maybeEmitter;

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
