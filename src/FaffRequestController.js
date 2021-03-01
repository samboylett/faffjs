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
        return class extends FaffRequestController {
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
}

export default FaffRequestController;
