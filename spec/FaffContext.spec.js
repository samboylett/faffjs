import { FaffContext } from '../src/index';

describe('FaffContext', () => {
    let faff;
    let params;

    beforeEach(() => {
        faff = {
            request: jest.fn().mockReturnValue(4),
            dispatch: jest.fn().mockReturnValue(5),
        };

        params = { foo: 'bar' };
    });

    describe('when instantiated', () => {
        let context;

        beforeEach(() => {
            context = new FaffContext(faff, params);
        });

        it('sets faff', () => {
            expect(context.faff).toBe(faff);
        });

        it('sets params', () => {
            expect(context.params).toBe(params);
        });

        ['request', 'dispatch'].forEach(fn => {
            describe(`Proxy function ${ fn }`, () => {
                let retVal;
                let calledWith;

                beforeEach(() => {
                    calledWith = ['foo', Math.random()];
                    retVal = context[fn](...calledWith);
                });

                it(`calls faff.${ fn } with same args`, () => {
                    expect(faff[fn]).toHaveBeenCalledWith(...calledWith);
                });

                it(`returns value from faff.${ fn }`, () => {
                    expect(retVal).toEqual(faff[fn]());
                });
            });
        });
    });
});
