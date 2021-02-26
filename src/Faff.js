import {
    FaffCallAlreadyDefinedError,
    FaffUnknownMethodError,
} from './errors/index';

import FaffContext from './FaffContext';

export default class FaffJS {
    constructor() {
        this.actions = {};
        this.loadingCount = 0;
    }

    get loading() {
        return this.loadingCount > 0;
    }

    requestAdapter(...args) {
        return fetch(...args);
    }

    async request(...args) {
        try {
            this.loadingCount++;

            return await this.requestAdapter(...args);
        } finally {
            this.loadingCount--;
        }
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

        const context = new FaffContext(this, params);
        let response;

        try {
            response = await action.request(context, params);
        } catch(e) {
            context.error = e;

            throw action.error
                ? action.error(context, e)
                : e;
        }

        context.response = response;

        return action.success
            ? action.success(context, response)
            : response;
    }
}
