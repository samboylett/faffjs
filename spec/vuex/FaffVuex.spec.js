import EventEmitter from 'events';

import FaffJS, {
    FaffVuex,
} from '../../src/index';

describe('FaffVuex', () => {
    let faff;

    it('is instantiable', () => {
        faff = new FaffVuex();

        expect(faff).toEqual(expect.any(Object));
    });

    describe('when instantiated', () => {
        beforeEach(() => {
            faff = new FaffVuex();
        });

        it('is an instance of FaffJS', () => {
            expect(faff).toEqual(expect.any(FaffJS));
        });
    });
});
