import FaffBaseError from './FaffBaseError';

/**
 * Thrown when an action key has already been defined.
 */
export default class FaffCallAlreadyDefinedError extends FaffBaseError {
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
