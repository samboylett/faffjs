import { FaffCallAlreadyDefinedError } from './errors/index';

export default class FaffJS {
    constructor() {
        this.calls = {};
    }

    add(key, fn) {
        if (this.calls[key]) {
            throw new FaffCallAlreadyDefinedError({ key });
        }

        this.calls[key] = fn;

        return this;
    }
}
