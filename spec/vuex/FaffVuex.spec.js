import EventEmitter from 'events';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';

import FaffJS, {
    FaffVuex,
    FaffContext,
} from '../../src/index';

describe('FaffVuex', () => {
    let faff;
    let requestFn;
    let requestFnPromise;
    let requestFnResolve;
    let requestFnReject;
    let errorFn;
    let successFn;

    const context = expect.any(FaffContext);

    it('is instantiable', () => {
        faff = new FaffVuex();

        expect(faff).toEqual(expect.any(Object));
    });

    describe('when instantiated', () => {
        beforeEach(() => {
            faff = new FaffVuex();

            requestFnPromise = new Promise((resolve, reject) => {
                requestFnResolve = resolve;
                requestFnReject = reject;
            });

            requestFn = jest.fn().mockReturnValue(requestFnPromise);
            errorFn = jest.fn().mockReturnValue('errorValue');
            successFn = jest.fn().mockReturnValue('successValue');
        });

        it('is an instance of FaffJS', () => {
            expect(faff).toEqual(expect.any(FaffJS));
        });

        describe('store module', () => {
            let store;
            let vm;
            let faffModule;
            let retVal;
            let LocalVue;

            beforeEach(() => {
                faff.add('foo', {
                    request: requestFn,
                    success: successFn,
                    error: errorFn,
                });

                LocalVue = createLocalVue();

                LocalVue.use(Vuex);

                faffModule = faff.toModule();
                store = new Vuex.Store({
                    modules: {
                        faff: faffModule,
                    },
                });

                vm = new LocalVue({
                    store,
                });
            });

            afterEach(async() => {
                requestFnResolve();

                try {
                    await retVal;
                } catch(e) {
                    // do nothing
                }
            });

            const allFunctionTests = () => {
                it('sets loading to true', async () => {
                    expect(vm.$store.getters['faff/loading']).toBe(true);
                });

                it('returns a promise', () => {
                    expect(retVal).toEqual(expect.any(Promise));
                });

                describe('when request function resolves', () => {
                    beforeEach(() => {
                        requestFnResolve('c');
                    });

                    it('calls success function with the value', async() => {
                        expect(successFn).toHaveBeenCalledWith(context, 'c');
                    });

                    it('returned promise resolves with the success function return value', async() => {
                        await expect(retVal).resolves.toBe('successValue');
                    });

                    it('sets loading to false', async () => {
                        await retVal;

                        expect(vm.$store.getters['faff/loading']).toBe(false);
                    });
                });

                describe('when request function rejects', () => {
                    beforeEach(() => {
                        requestFnReject('d');
                    });

                    it('calls error function with the value', async() => {
                        expect(errorFn).toHaveBeenCalledWith(context, 'd');
                    });

                    it('returned promise rejects with the error function return value', async() => {
                        await expect(retVal).rejects.toBe('errorValue');
                    });

                    it('sets loading to false', async () => {
                        try {
                            await retVal;
                        } catch(e) {
                            // do nothing
                        }

                        expect(vm.$store.getters['faff/loading']).toBe(false);
                    });
                });
            };

            describe('when calling with no argument', () => {
                beforeEach(async() => {
                    retVal = store.dispatch('faff/foo');
                });

                it('calls the request function with context and argument as null', () => {
                    expect(requestFn).toHaveBeenCalledWith(context, null);
                });

                allFunctionTests();
            });

            describe('when calling with argument', () => {
                beforeEach(() => {
                    retVal = store.dispatch('faff/foo', 'test');
                });

                it('calls the request function with context and argument', () => {
                    expect(requestFn).toHaveBeenCalledWith(context, 'test');
                });

                allFunctionTests();
            });
        });
    });
});
