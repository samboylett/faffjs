import { FaffArgumentError } from './errors/index';

/**
 * Action options.
 *
 * @typedef {object} FaffRequestControllerTemplate
 * @property {Function} request - Function to send the request.
 * @property {Function?} success - Function to parse the response.
 * @property {Function?} error - Function to parse the error.
 */

/**
 * Base class all Faff controllers should extend.
 */
class FaffRequestController {
    /**
     * Build a basic controller based on the supplied functions.
     *
     * @param {FaffRequestControllerTemplate} dto
     * @returns {object}
     */
    static build({ request, success = null, error = null }) {
        const klass = class extends FaffRequestController {};

        klass.prototype.request = request;

        if (success) {
            klass.prototype.success = success;
        }

        if (error) {
            klass.prototype.error = error;
        }

        return klass;
    }

    /**
     * Perform the request. This must be overridden.
     *
     * @throws {FaffArgumentError}
     */
    request() {
        throw new FaffArgumentError('request must be overridden');
    }

    /**
     * Perform the success parse.
     *
     * @param {object} context
     * @param {any} response
     * @returns {any}
     */
    success(context, response) {
        return response;
    }

    /**
     * Perform the error parse.
     *
     * @param {object} context
     * @param {any} response
     * @returns {any}
     */
    error(context, response) {
        return response;
    }
}

export default FaffRequestController;
