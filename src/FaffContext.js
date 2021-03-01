/**
 * Context class passed to action methods.
 */
class FaffContext {
    /**
     * Constructor.
     *
     * @param {object} faff
     * @param {any} params
     */
    constructor(faff, params) {
        this.faff = faff;
        this.params = params;
    }

    /**
     * Proxy to faff request.
     *
     * @param {any[]} ...args
     * @returns {any}
     */
    request(...args) {
        return this.faff.request(...args);
    }

    /**
     * Proxy to faff dispatch.
     *
     * @param {any[]} ...args
     * @returns {any}
     */
    dispatch(...args) {
        return this.faff.dispatch(...args);
    }
}

export default FaffContext;
