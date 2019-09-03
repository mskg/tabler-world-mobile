import { IPrincipal } from '../types/IPrincipal';
import { calculateLevel } from './calculateLevel';
import { FieldNames } from './FieldNames';
import { FilterLevel } from './FilterLevel';

// tslint:disable: no-unused-expression
// tslint:disable: mocha-no-side-effect-code


const principal = {
    area: 1,
    club: 2,
    association: 'de',
    email: 'email',
    id: 3,
} as IPrincipal;


describe('calculateLevel', () => {
    test('same person', () => {

        const result = calculateLevel(principal, {
            [FieldNames.Id]: principal.id,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: principal.association,
        });

        expect(result).toEqual(FilterLevel.SamePerson);
    });

    test('not same person', () => {

        const result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: principal.association,
        });

        expect(result).not.toEqual(FilterLevel.SamePerson);
    });

    test('same club', () => {

        const result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: principal.association,
        });

        expect(result).toEqual(FilterLevel.SameClub);
    });

    test('not same club', () => {

        let result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: 815,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: principal.association,
        });

        expect(result).not.toEqual(FilterLevel.SameClub);

        result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: 815,
            [FieldNames.Association]: principal.association,
        });

        expect(result).not.toEqual(FilterLevel.SameClub);

        result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: 'other',
        });

        expect(result).not.toEqual(FilterLevel.SameClub);
    });

    test('same area', () => {
        const result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: 815,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: principal.association,
        });

        expect(result).toEqual(FilterLevel.SameArea);
    });

    test('not same area', () => {
        let result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: 815,
            [FieldNames.Area]: 815,
            [FieldNames.Association]: principal.association,
        });

        expect(result).not.toEqual(FilterLevel.SameArea);

        result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: principal.club,
            [FieldNames.Area]: principal.area,
            [FieldNames.Association]: 'other',
        });

        expect(result).not.toEqual(FilterLevel.SameArea);
    });

    test('same association', () => {

        const result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: 815,
            [FieldNames.Area]: 815,
            [FieldNames.Association]: principal.association,
        });

        expect(result).toEqual(FilterLevel.SameAssociation);
    });

    test('not same association', () => {

        const result = calculateLevel(principal, {
            [FieldNames.Id]: 815,
            [FieldNames.Club]: 815,
            [FieldNames.Area]: 815,
            [FieldNames.Association]: 'other',
        });

        expect(result).not.toEqual(FilterLevel.SameAssociation);
    });
});
