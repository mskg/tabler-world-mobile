import { hasRole } from './hasRole';

// tslint:disable: mocha-no-side-effect-code

describe('roles', () => {
    test('not existing', () => {
        // @ts-ignore
        const out = hasRole({}, 'role');
        expect(out).toBeFalsy();
    });

    test('no value', () => {
        // @ts-ignore
        const out = hasRole({ roles: undefined }, 'role');
        expect(out).toBeFalsy();
    });

    test('empty', () => {
        // @ts-ignore
        const out = hasRole({ roles: [] }, 'role');
        expect(out).toBeFalsy();
    });

    test('true', () => {
        // @ts-ignore
        const out = hasRole({ roles: ['role'] }, 'role');
        expect(out).toBeTruthy();
    });
});
