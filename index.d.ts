/// <reference types="node" />

import {Property} from 'kefir';

export default function udKefir<T>(module_: typeof module, value: T, key?: string): Property<T,never>;
