import FaffJS, { errors } from '../src/index';

describe('FaffJS', () => {
    let faff;
    let callFunction;

    it('is instantiable', () => {
        faff = new FaffJS();

        expect(faff).toEqual(expect.any(Object));
    });

    describe('when instantiated', () => {
        beforeEach(() => {
            faff = new FaffJS();
            callFunction = jest.fn();
        });

        it('has an empty calls object', () => {
            expect(faff.calls).toEqual({});
        });

        describe('add', () => {
            it('is a function', () => {
                expect(faff.add).toEqual(expect.any(Function));
            });

            describe('when called', () => {
                let retVal;

                beforeEach(() => {
                    retVal = faff.add('foo', callFunction);
                });

                it('adds a call to the calls array', () => {
                    expect(faff.calls).toEqual({
                        foo: callFunction,
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
        });
    });
});
