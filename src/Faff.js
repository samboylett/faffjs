import {
    FaffCallAlreadyDefinedError,
    FaffUnknownMethodError,
} from './errors/index';

import FaffContext from './FaffContext';
import FaffRequestController from './FaffRequestController';

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

    add(key, reqArg) {
        if (this.actions[key]) {
            throw new FaffCallAlreadyDefinedError({ key });
        }

        if (FaffRequestController.isPrototypeOf(reqArg)) {
            this.actions[key] = reqArg;
        } else {
            const { request, success = null, error = null } = reqArg;

            this.actions[key] = class extends FaffRequestController {
                request(...args) {
                    return request(...args);
                }

                success(context, response) {
                    return success ? success(context, response) : response;
                }

                error(context, response) {
                    return error ? error(context, response) : response;
                }
            };
        }

        return this;
    }

    async dispatch(key, params = null) {
        const Controller = this.actions[key];

        if (!Controller) {
            throw new FaffUnknownMethodError({ key });
        }

        const context = new FaffContext(this, params);
        const controller = new Controller();
        let response;

        try {
            response = await controller.request(context, params);
        } catch(e) {
            context.error = e;

            throw controller.error(context, e);
        }

        context.response = response;

        return controller.success(context, response);
    }
}
