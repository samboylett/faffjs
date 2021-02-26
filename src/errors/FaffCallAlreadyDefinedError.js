import FaffBaseError from './FaffBaseError';

export default class FaffCallAlreadyDefinedError extends FaffBaseError {
    constructor({ key }) {
        super(`Call key alredy defined: ${ key }`);
    }
}
