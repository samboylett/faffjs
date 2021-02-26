import FaffJS from '../src/index';

describe('sugar', () => {
    let faff;
    let requestFn;
    let errorFn;
    let successFn;

    beforeEach(() => {
        faff = new FaffJS();

        requestFn = jest.fn().mockReturnValue(Promise.resolve('ok'));
        errorFn = jest.fn().mockReturnValue('errorValue');
        successFn = jest.fn().mockReturnValue('successValue');
    });

    describe('basic success', () => {
        beforeEach(() => {
            faff.add('foobar', {
                request() {
                    return Promise.resolve({
                        data: {
                            foo: 'bar',
                        },
                    });
                },

                success(context, response) {
                    return ['rab', response.data.foo].join('');
                },
            });
        });

        it('resolves to the expected value', async () => {
            await expect(faff.dispatch('foobar'))
                .resolves.toEqual('rabbar');
        });
    });

    describe('basic error', () => {
        beforeEach(() => {
            faff.add('foobar', {
                request() {
                    return Promise.reject({
                        data: {
                            bar: 'foo',
                        },
                    });
                },

                error(context, response) {
                    return ['rab', response.data.bar].join('');
                },
            });
        });

        it('rejects to the expected value', async () => {
            await expect(faff.dispatch('foobar'))
                .rejects.toEqual('rabfoo');
        });
    });
});
