import FaffJS, {
    errors,
    FaffContext,
} from '../src/index';

describe('FaffJS', () => {
    let faff;
    let requestFn;
    let requestFnPromise;
    let requestFnResolve;
    let requestFnReject;
    let errorFn;
    let successFn;

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
            errorFn = jest.fn();
            successFn = jest.fn();
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
                        foo: {
                            request: requestFn,
                            error: null,
                            success: null,
                        },
                    });
                });

                it('returns faff', () => {
                    expect(retVal).toBe(faff);
                });

                it('throws if called with the same key', () => {
                    expect(() => {
                        faff.add('foo', () => {});
                    }).toThrow(new errors.FaffCallAlreadyDefinedError({ key: 'foo' }));
                });
            });

            describe('when called with an error function argument', () => {
                let retVal;

                beforeEach(() => {
                    retVal = faff.add('foo', { request: requestFn, error: errorFn });
                });

                it('adds a call to the actions object with an error function', () => {
                    expect(faff.actions).toEqual({
                        foo: {
                            request: requestFn,
                            error: errorFn,
                            success: null,
                        },
                    });
                });
            });

            describe('when called with a success function argument', () => {
                let retVal;

                beforeEach(() => {
                    retVal = faff.add('foo', { request: requestFn, error: errorFn, success: successFn });
                });

                it('adds a call to the actions object with a success function', () => {
                    expect(faff.actions).toEqual({
                        foo: {
                            request: requestFn,
                            error: errorFn,
                            success: successFn,
                        },
                    });
                });
            });
        });

        describe('dispatch', () => {
            it('is a function', () => {
                expect(faff.dispatch).toEqual(expect.any(Function));
            });

            it('throws when called with an unknown key', async () => {
                await expect(faff.dispatch('bar'))
                    .rejects.toThrow(new errors.FaffUnknownMethodError({ key: 'bar' }));
            });

            describe('when the method has no error function', () => {
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

                        it('returned promise resolves with the value', async () => {
                            await expect(retVal).resolves.toBe('a');
                        });
                    });

                    describe('when request function rejects', () => {
                        beforeEach(() => {
                            requestFnReject('b');
                        });

                        it('returned promise rejects with the value', async () => {
                            await expect(retVal).rejects.toBe('b');
                        });
                    });
                };

                describe('when calling with no argument', () => {
                    beforeEach(async () => {
                        retVal = faff.dispatch('foo');
                    });

                    it('calls the request function with context and argument as null', () => {
                        expect(requestFn).toHaveBeenCalledWith(expect.any(FaffContext), null);
                    });

                    noErrorFunctionTests();
                });

                describe('when calling with argument', () => {
                    beforeEach(() => {
                        retVal = faff.dispatch('foo', 'test');
                    });

                    it('calls the request function with context and argument', () => {
                        expect(requestFn).toHaveBeenCalledWith(expect.any(FaffContext), 'test');
                    });

                    noErrorFunctionTests();
                });
            });
        });
    });
});
