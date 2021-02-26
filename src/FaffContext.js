export default class FaffContext {
    constructor(faff, params) {
        this.faff = faff;
        this.params = params;
    }

    request(...args) {
        return this.faff.request(...args);
    }

    dispatch(...args) {
        return this.faff.dispatch(...args);
    }
}
