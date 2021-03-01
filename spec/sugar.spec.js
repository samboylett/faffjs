import FaffJS, {
    FaffRequestController,
    errors,
} from '../src/index';

describe('sugar', () => {
    let faff;

    beforeEach(() => {
        faff = new FaffJS();
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

        it('resolves to the expected value', async() => {
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

        it('rejects to the expected value', async() => {
            await expect(faff.dispatch('foobar'))
                .rejects.toEqual('rabfoo');
        });
    });

    describe('when request not overridden', () => {
        class BasicRequest extends FaffRequestController {}

        beforeEach(() => {
            faff.add('foobar', BasicRequest);
        });

        it('throws when called', async() => {
            await expect(faff.dispatch('foobar')).rejects.toEqual(new errors.FaffArgumentError('request must be overridden'));
        });
    });

    describe('class prototype success', () => {
        class BasicRequest extends FaffRequestController {
            request() {
                return Promise.resolve({
                    data: 'foo',
                });
            }

            success(context, response) {
                return response.data.toUpperCase();
            }
        }

        beforeEach(() => {
            faff.add('foobar', BasicRequest);
        });

        it('resolves to the expected value', async() => {
            await expect(faff.dispatch('foobar'))
                .resolves.toEqual('FOO');
        });
    });

    describe('class prototype error', () => {
        class BasicRequest extends FaffRequestController {
            request() {
                return Promise.reject({
                    data: 'bar',
                });
            }

            error(context, response) {
                return response.data.toUpperCase();
            }
        }

        beforeEach(() => {
            faff.add('foobar', BasicRequest);
        });

        it('rejects to the expected value', async() => {
            await expect(faff.dispatch('foobar'))
                .rejects.toEqual('BAR');
        });
    });
});
