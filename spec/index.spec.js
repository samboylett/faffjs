import FaffJS from '../src/index';

describe('FaffJS', () => {
    it('is instantiable', () => {
        const faffjs = new FaffJS();

        expect(faffjs).toEqual(expect.any(Object));
    });
});
