import FaffBaseError from './FaffBaseError';

export default class FaffUnknownMethodError extends FaffBaseError {
    constructor({ key }) {
        super(`Unknown method key: ${ key }`);
    }
}
