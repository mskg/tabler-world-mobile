import { ASSOCIATION, CLUB, PRIVATE, PUBLIC } from './DBLevels';
import { FilterLevel } from './FilterLevel';
import { hasAccess } from './hasAccess';

// tslint:disable: no-unused-expression
// tslint:disable: mocha-no-side-effect-code

describe('hasAccess', () => {

    test('PUBLIC', () => {
        expect(hasAccess(PUBLIC, FilterLevel.Public)).toEqual(true);
        expect(hasAccess(PUBLIC, FilterLevel.SameArea)).toEqual(true);
        expect(hasAccess(PUBLIC, FilterLevel.SameAssociation)).toEqual(true);
        expect(hasAccess(PUBLIC, FilterLevel.SameClub)).toEqual(true);
        expect(hasAccess(PUBLIC, FilterLevel.SamePerson)).toEqual(true);
    });

    test('PRIVATE', () => {
        expect(hasAccess(PRIVATE, FilterLevel.Public)).toEqual(false);
        expect(hasAccess(PRIVATE, FilterLevel.SameArea)).toEqual(false);
        expect(hasAccess(PRIVATE, FilterLevel.SameAssociation)).toEqual(false);
        expect(hasAccess(PRIVATE, FilterLevel.SameClub)).toEqual(false);
        expect(hasAccess(PRIVATE, FilterLevel.SamePerson)).toEqual(true);
    });

    test('CLUB', () => {
        expect(hasAccess(CLUB, FilterLevel.Public)).toEqual(false);
        expect(hasAccess(CLUB, FilterLevel.SameArea)).toEqual(false);
        expect(hasAccess(CLUB, FilterLevel.SameAssociation)).toEqual(false);
        expect(hasAccess(CLUB, FilterLevel.SameClub)).toEqual(true);
        expect(hasAccess(CLUB, FilterLevel.SamePerson)).toEqual(true);
    });

    test('ASSOCIATION', () => {
        expect(hasAccess(ASSOCIATION, FilterLevel.Public)).toEqual(false);
        expect(hasAccess(ASSOCIATION, FilterLevel.SameArea)).toEqual(true);
        expect(hasAccess(ASSOCIATION, FilterLevel.SameAssociation)).toEqual(true);
        expect(hasAccess(ASSOCIATION, FilterLevel.SameClub)).toEqual(true);
        expect(hasAccess(ASSOCIATION, FilterLevel.SamePerson)).toEqual(true);
    });
});
