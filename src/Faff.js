import {
    FaffCallAlreadyDefinedError,
    FaffUnknownMethodError,
} from './errors/index';

import FaffContext from './FaffContext';
import FaffRequestController from './FaffRequestController';

/**
 * Main class.
 */
export default class FaffJS {
    /**
     * Constructor.
     */
    constructor() {
        this.actions = {};
        this.loadingCount = 0;
    }

    /**
     * See if any requests are loading or not.
     *
     * @returns {boolean}
     */
    get loading() {
        return this.loadingCount > 0;
    }

    /**
     * Adapter request uses to call a fetching library. Can be overridden.
     *
     * @param {any[]} ...args
     * @returns {any}
     */
    requestAdapter(...args) {
        return fetch(...args);
    }

    /**
     * Do a HTTP request. Calls requestAdapter.
     *
     * @param {any[]} ...args
     * @returns {any}
     */
    async request(...args) {
        try {
            this.loadingCount++;

            return await this.requestAdapter(...args);
        } finally {
            this.loadingCount--;
        }
    }

    /**
     * Add an action.
     *
     * @param {string} key
     * @param {FaffRequestControllerTemplate|FaffRequestController} controllerOrTemplate
     * @returns {FaffJS}
     */
    add(key, controllerOrTemplate) {
        if (this.actions[key]) {
            throw new FaffCallAlreadyDefinedError({ key });
        }

        this.actions[key] = FaffRequestController.isPrototypeOf(controllerOrTemplate)
            ? controllerOrTemplate
            : FaffRequestController.build(controllerOrTemplate);

        return this;
    }

    /**
     * Dispatch a new action request.
     *
     * @param {string} key
     * @param {any} params
     * @returns {any}
     */
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
