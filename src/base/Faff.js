import EventEmitter from 'events';

import {
    FaffCallAlreadyDefinedError,
    FaffUnknownMethodError,
} from '../errors/index';

import FaffContext from '../FaffContext';
import FaffRequestController from '../FaffRequestController';

/**
 * Main class.
 *
 * @property {EventEmitter} events - Object where class events are emitted.
 */
class FaffJS {
    /**
     * Constructor.
     */
    constructor() {
        const events = new EventEmitter();
        let loadingCount = 0;

        this.actions = {};

        Object.defineProperty(this, 'events', {
            /**
             * Get the event emitter instance.
             *
             * @ignore
             * @returns {EventEmitter}
             */
            get() {
                return events;
            },
        });

        Object.defineProperty(this, 'loadingCount', {
            /**
             * Get the loading count.
             *
             * @ignore
             * @returns {number}
             */
            get() {
                return loadingCount;
            },

            /**
             * Set the loading count.
             *
             * @ignore
             * @param {number} concurrent
             */
            set(concurrent) {
                loadingCount = concurrent;

                this.events.emit('loadingUpdate', {
                    concurrent,
                });
            },
        });
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
     * Emit events around a function call.
     *
     * @private
     * @param {string} name
     * @param {any} eventParams
     * @param {function} call
     * @returns {any}
     */
    async emitAround(name, eventParams, call) {
        this.events.emit(`before${ name }`, eventParams);

        try {
            return await call();
        } finally {
            this.events.emit(`after${ name }`, eventParams);
        }
    }

    /**
     * Dispatch a new action request.
     *
     * @private
     * @param {string} key
     * @param {any} params
     * @param {object} options
     * @returns {any}
     */
    async dispatchWithOptions(key, params, {
        context = new FaffContext(this, params),
    } = {}) {
        const Controller = this.actions[key];

        if (!Controller) {
            throw new FaffUnknownMethodError({ key });
        }

        const controller = new Controller();
        const eventParams = {
            key,
            params,
            context,
        };
        let response;

        try {
            await this.emitAround('Request', eventParams, async() => {
                response = await controller.request(context, params);
            });
        } catch(e) {
            context.error = e;

            await this.emitAround('Error', eventParams, async() => {
                throw controller.error(context, context.error);
            });
        }

        context.response = response;

        return await this.emitAround('Success', eventParams, async() => {
            return await controller.success(context, response);
        });
    }

    /**
     * Dispatch a new action request.
     *
     * @param {string} key
     * @param {any} params
     * @returns {any}
     */
    async dispatch(key, params = null) {
        return await this.dispatchWithOptions(key, params);
    }
}

export default FaffJS;
