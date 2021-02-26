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
        const action = this.actions[key];

        if (!action) {
            throw new FaffUnknownMethodError({ key });
        }

        const context = new FaffContext();
        let value;

        try {
            value = await action.request(context, params);
        } catch(e) {
            throw action.error
                ? action.error(context, e)
                : e;
        }

        return action.success
            ? action.success(context, value)
            : value;
    }
}
