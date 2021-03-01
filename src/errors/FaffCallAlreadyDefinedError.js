import FaffBaseError from './FaffBaseError';

/**
 * Thrown when an action key has already been defined.
 * @memberof module:Errors
 */
class FaffCallAlreadyDefinedError extends FaffBaseError {
    /**
     * Constructor.
     *
     * @param {object} dto
     * @param {string} dto.key
     */
    constructor({ key }) {
        super(`Call key alredy defined: ${ key }`);
    }
}

export default FaffCallAlreadyDefinedError;
