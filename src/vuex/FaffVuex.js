import FaffJS from '../base/Faff';
import FaffContext from '../FaffContext';

/**
 * Vuex store module.
 *
 * @typedef {object} VuexStoreModule
 * @property {boolean} namespaced
 * @property {object} actions
 */

/**
 * An extension of Faff which exports a Vuex module to provide easier access
 * in a Vue app.
 */
class FaffVuex extends FaffJS {
    /**
     * Convert the FaffJS instance to a Vuex store module.
     *
     * @param {object} options
     * @param {boolean} [options.namespaced=true]
     * @returns {VuexStoreModule}
     */
    toModule({
        namespaced = true,
    } = {}) {
        const actions = {};

        Object.keys(this.actions).forEach(key => {
            actions[key] = (storeContext, params = null) => {
                const context = new FaffContext(this, params);
                context.$store = storeContext;

                return this.dispatchWithOptions(key, params, {
                    context,
                });
            };
        });

        return {
            namespaced,
            actions,
        };
    }
}

export default FaffVuex;
