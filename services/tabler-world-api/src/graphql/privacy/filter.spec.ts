import { IPrincipal } from '../types/IPrincipal';
import { ASSOCIATION, CLUB } from './DBLevels';
import { FieldNames, standard_fields, system_fields } from './FieldNames';
import { filter } from './filter';

// tslint:disable: no-unused-expression
// tslint:disable: mocha-no-side-effect-code

const principal = {
    area: 1,
    club: 2,
    association: 'de',
    email: 'email',
    id: 3,
} as IPrincipal;

const standardFields = [...system_fields, ...standard_fields].reduce(
    (p, c) => {
        p[c] = 'defined';
        return p;
    },
    {} as any,
);

const defaultTabler = {
    ...standardFields,

    // additional field
    doesnotexist: true,

    [FieldNames.Address]: {
        id: 123,
    },

    [FieldNames.Phonenumbers]: [
        {
            id: 123,
        },
        {
            id: 456,
        },
    ],

    [FieldNames.Emails]: [
        {
            id: 123,
        },
        {
            id: 456,
        },
    ],

    [FieldNames.Partner]: 'partner',
    [FieldNames.Educations]: [1, 2, 3],
    [FieldNames.Companies]: [1, 2, 3],
    [FieldNames.BirthDate]: new Date(),

    [FieldNames.PrivacySettings]: [
        {
            type: 'company-position',
            level: ASSOCIATION,
        },
        {
            type: 'education',
            level: ASSOCIATION,
        },
        {
            type: 'custom-field-category-110',
            level: ASSOCIATION,
        },
        {
            type: 'address-123',
            level: ASSOCIATION,
        },
        {
            type: 'phone-123',
            level: ASSOCIATION,
        },
        {
            type: 'phone-456',
            level: CLUB,
        },
        {
            type: 'secondary-email-123',
            level: ASSOCIATION,
        },
        {
            type: 'secondary-email-456',
            level: CLUB,
        },
        {
            type: 'birth_date',
            level: ASSOCIATION,
        },
    ],
};

const securedFields = [
    FieldNames.Address,
    FieldNames.Phonenumbers,
    FieldNames.Emails,
    FieldNames.BirthDate,
    FieldNames.Educations,
    FieldNames.Companies,
    FieldNames.Partner,
];

describe('filter', () => {
    test('standard fields', () => {
        const result = filter(
            {
                ...principal,
                association: 'other',
            },
            defaultTabler,
        );

        expect(result).toMatchObject(standardFields);

        for (const field of securedFields) {
            expect(result[field]).toBeUndefined();
        }
    });

    for (const field of securedFields) {
        test(field, () => {
            const result = filter(
                {
                    ...principal,
                    id: 815,
                },
                defaultTabler,
            );

            expect(result).toMatchObject(standardFields);
            expect(result[field]).not.toBeNull();
        });
    }
});
