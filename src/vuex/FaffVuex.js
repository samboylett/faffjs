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
        const state = () => ({
            loadingCount: 0,
        });
        const mutations = {
            increaseLoading: (state) => {
                state.loadingCount++;
            },

            decreaseLoading: (state) => {
                state.loadingCount--;
            },
        };
        const getters = {
            loading: state => {
                return state.loadingCount > 0;
            },
        };

        Object.keys(this.actions).forEach(key => {
            actions[key] = async(storeContext, params = null) => {
                const context = new FaffContext(this, params);
                context.$store = storeContext;

                try {
                    storeContext.commit('increaseLoading');

                    return await this.dispatchWithOptions(key, params, {
                        context,
                    });
                } finally {
                    storeContext.commit('decreaseLoading');
                }
            };
        });

        return {
            namespaced,
            actions,
            state,
            mutations,
            getters,
        };
    }
}

export default FaffVuex;
