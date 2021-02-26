import {
    FaffCallAlreadyDefinedError,
    FaffUnknownMethodError,
} from './errors/index';

import FaffContext from './FaffContext';

export default class FaffJS {
    constructor() {
        this.actions = {};
    }

    add(key, { request, success = null, error = null }) {
        if (this.actions[key]) {
            throw new FaffCallAlreadyDefinedError({ key });
        }

        this.actions[key] = {
            request,
            success,
            error,
        };

        return this;
    }

    async dispatch(key, params = null) {
        if (!this.actions[key]) {
            throw new FaffUnknownMethodError({ key });
        }

        const context = new FaffContext();

        const value = await this.actions[key].request(context, params);

        return value;
    }
}
