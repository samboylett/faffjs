import EventEmitter from 'events';

import FaffJS, {
    errors,
    FaffContext,
} from '../../src/index';

describe('FaffJS', () => {
    let faff;
    let requestFn;
    let requestFnPromise;
    let requestFnResolve;
    let requestFnReject;
    let errorFn;
    let successFn;

    const context = expect.any(FaffContext);

    it('is instantiable', () => {
        faff = new FaffJS();

        expect(faff).toEqual(expect.any(Object));
    });

    describe('when instantiated', () => {
        beforeEach(() => {
            faff = new FaffJS();

            requestFnPromise = new Promise((resolve, reject) => {
                requestFnResolve = resolve;
                requestFnReject = reject;
            });

            requestFn = jest.fn().mockReturnValue(requestFnPromise);
            errorFn = jest.fn().mockReturnValue('errorValue');
            successFn = jest.fn().mockReturnValue('successValue');
        });

        describe('events', () => {
            it('is an instance of EventEmitter', () => {
                expect(faff.events).toEqual(expect.any(EventEmitter));
            });

            it('is not writable', () => {
                expect(() => {
                    faff.events = {};
                }).toThrow();
            });
        });

        describe('requestAdapter', () => {
            beforeEach(() => {
                global.fetch = jest.fn().mockReturnValue('g');
            });

            it('calls fetch with supplied args', () => {
                faff.requestAdapter(1, 'foo');

                expect(fetch).toHaveBeenCalledWith(1, 'foo');
            });

            it('returns value from fetch', () => {
                expect(faff.requestAdapter()).toEqual('g');
            });
        });

        describe('request', () => {
            let requestAdapterPromise;
            let requestAdapterResolve;
            let requestAdapterReject;
            let retVal;

            beforeEach(() => {
                requestAdapterPromise = new Promise((resolve, reject) => {
                    requestAdapterResolve = resolve;
                    requestAdapterReject = reject;
                });

                faff.requestAdapter = jest.fn().mockReturnValue(requestAdapterPromise);

                expect(faff.loadingCount).toBe(0);
                expect(faff.loading).toBe(false);

                retVal = faff.request(2, 'bar');
            });

            it('calls requestAdapter with supplied args', () => {
                expect(faff.requestAdapter).toHaveBeenCalledWith(2, 'bar');
            });

            it('returns a promise', () => {
                expect(retVal).toEqual(expect.any(Promise));
            });

            it('increase loading count', () => {
                expect(faff.loadingCount).toBe(1);
            });

            it('sets loading state', () => {
                expect(faff.loading).toBe(true);
            });

            describe('when another call', () => {
                beforeEach(() => {
                    faff.request();
                });

                it('increase loading count', () => {
                    expect(faff.loadingCount).toBe(2);
                });

                it('maintains loading state', () => {
                    expect(faff.loading).toBe(true);
                });

                describe('when both promises resolve', () => {
                    beforeEach(() => {
                        requestAdapterResolve();
                    });

                    it('decreases loading count', () => {
                        expect(faff.loadingCount).toBe(0);
                    });

                    it('sets loading state', () => {
                        expect(faff.loading).toBe(false);
                    });
                });
            });

            describe('when resolves', () => {
                beforeEach(() => {
                    requestAdapterResolve('f');
                });

                it('resolves to the value', async() => {
                    await expect(retVal).resolves.toBe('f');
                });

                it('decreases loading count', () => {
                    expect(faff.loadingCount).toBe(0);
                });

                it('sets loading state', () => {
                    expect(faff.loading).toBe(false);
                });
            });

            describe('when rejects', () => {
                beforeEach(() => {
                    requestAdapterReject('fd');
                });

                it('rejects to the value', async() => {
                    await expect(retVal).rejects.toBe('fd');
                });

                it('decreases loading count', () => {
                    expect(faff.loadingCount).toBe(0);
                });

                it('sets loading state', () => {
                    expect(faff.loading).toBe(false);
                });
            });
        });

        it('has an empty calls object', () => {
            expect(faff.actions).toEqual({});
        });

        describe('add', () => {
            it('is a function', () => {
                expect(faff.add).toEqual(expect.any(Function));
            });

            describe('when called', () => {
                let retVal;

                beforeEach(() => {
                    retVal = faff.add('foo', { request: requestFn });
                });

                it('adds a call to the actions object', () => {
                    expect(faff.actions).toEqual({
                        foo: expect.any(Function),
                    });
                });

                it('returns faff', () => {
                    expect(retVal).toBe(faff);
                });

                it('throws if called with the same key', () => {
                    expect(() => {
                        faff.add('foo', {});
                    }).toThrow(new errors.FaffCallAlreadyDefinedError({ key: 'foo' }));
                });
            });

            describe('when called with an error function argument', () => {
                beforeEach(() => {
                    faff.add('foo', { request: requestFn, error: errorFn });
                });

                it('adds a call to the actions object with an error function', () => {
                    expect(faff.actions).toEqual({
                        foo: expect.any(Function),
                    });
                });
            });

            describe('when called with a success function argument', () => {
                beforeEach(() => {
                    faff.add('foo', { request: requestFn, error: errorFn, success: successFn });
                });

                it('adds a call to the actions object with a success function', () => {
                    expect(faff.actions).toEqual({
                        foo: expect.any(Function),
                    });
                });
            });
        });

        describe('dispatch', () => {
            it('is a function', () => {
                expect(faff.dispatch).toEqual(expect.any(Function));
            });

            it('throws when called with an unknown key', async() => {
                await expect(faff.dispatch('bar'))
                    .rejects.toThrow(new errors.FaffUnknownMethodError({ key: 'bar' }));
            });

            describe('when the method has only request function', () => {
                let retVal;

                beforeEach(() => {
                    faff.add('foo', { request: requestFn });
                });

                const noErrorFunctionTests = () => {
                    it('returns a promise', () => {
                        expect(retVal).toEqual(expect.any(Promise));
                    });

                    describe('when request function resolves', () => {
                        beforeEach(() => {
                            requestFnResolve('a');
                        });

                        it('returned promise resolves with the value', async() => {
                            await expect(retVal).resolves.toBe('a');
                        });
                    });

                    describe('when request function rejects', () => {
                        beforeEach(() => {
                            requestFnReject('b');
                        });

                        it('returned promise rejects with the value', async() => {
                            await expect(retVal).rejects.toBe('b');
                        });
                    });
                };

                describe('when calling with no argument', () => {
                    beforeEach(async() => {
                        retVal = faff.dispatch('foo');
                    });

                    it('calls the request function with context and argument as null', () => {
                        expect(requestFn).toHaveBeenCalledWith(context, null);
                    });

                    noErrorFunctionTests();
                });

                describe('when calling with argument', () => {
                    beforeEach(() => {
                        retVal = faff.dispatch('foo', 'test');
                    });

                    it('calls the request function with context and argument', () => {
                        expect(requestFn).toHaveBeenCalledWith(context, 'test');
                    });

                    noErrorFunctionTests();
                });
            });

            describe('when the method has all functions defined', () => {
                let retVal;

                beforeEach(() => {
                    faff.add('foo', {
                        request: requestFn,
                        success: successFn,
                        error: errorFn,
                    });
                });

                const allFunctionTests = () => {
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
                    });
                };

                describe('when calling with no argument', () => {
                    beforeEach(async() => {
                        retVal = faff.dispatch('foo');
                    });

                    it('calls the request function with context and argument as null', () => {
                        expect(requestFn).toHaveBeenCalledWith(context, null);
                    });

                    allFunctionTests();
                });

                describe('when calling with argument', () => {
                    beforeEach(() => {
                        retVal = faff.dispatch('foo', 'test');
                    });

                    it('calls the request function with context and argument', () => {
                        expect(requestFn).toHaveBeenCalledWith(context, 'test');
                    });

                    allFunctionTests();
                });
            });
        });
    });
});
