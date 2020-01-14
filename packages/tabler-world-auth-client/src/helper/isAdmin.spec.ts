import { isAdmin } from './isAdmin';

// tslint:disable: no-unused-expression
// tslint:disable: mocha-no-side-effect-code

describe('isAdmin', () => {
    test('null', () => {

        // @ts-ignore
        const result = isAdmin(null);
        expect(result).toEqual(false);
    });

    test('false', () => {

        // @ts-ignore
        const result = isAdmin({ id: 123 });
        expect(result).toEqual(false);
    });


    test('true', () => {

        // @ts-ignore
        const result = isAdmin({ id: 14225 });
        expect(result).toEqual(true);
    });
});
