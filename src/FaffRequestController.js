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
export default class FaffRequestController {
    /**
     * Build a basic controller based on the supplied functions.
     *
     * @param {FaffRequestControllerTemplate} dto
     * @returns {object}
     */
    static build({ request, success = null, error = null }) {
        return class extends FaffRequestController {
            /**
             * Perform the request.
             *
             * @param {any[]} ...args
             * @returns {Promise<any>}
             */
            request(...args) {
                return request(...args);
            }

            /**
             * Perform the success parse.
             *
             * @param {object} context
             * @param {any} response
             * @returns {Promise<any>}
             */
            success(context, response) {
                return success ? success(context, response) : response;
            }

            /**
             * Perform the error parse.
             *
             * @param {object} context
             * @param {any} response
             * @returns {Promise<any>}
             */
            error(context, response) {
                return error ? error(context, response) : response;
            }
        };
    }
}
