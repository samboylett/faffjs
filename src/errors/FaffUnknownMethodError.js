import FaffBaseError from './FaffBaseError';

/**
 * Thrown when a dispatch is made to an unknown action.
 */
class FaffUnknownMethodError extends FaffBaseError {
    /**
     * Constructor.
     *
     * @param {object} dto
     * @param {string} dto.key
     */
    constructor({ key }) {
        super(`Unknown method key: ${ key }`);
    }
}

export default FaffUnknownMethodError;
