import { ASSOCIATION, CLUB, PRIVATE, PUBLIC } from './DBLevels';
import { FieldNames } from './FieldNames';
import { getPrivacySetting } from './getPrivacySetting';

// tslint:disable: no-unused-expression
// tslint:disable: mocha-no-side-effect-code

describe('getPrivacySetting', () => {

    test('private', () => {
        const result = getPrivacySetting(
            {
                [FieldNames.PrivacySettings]: null,
            },
            'xyz',
        );

        expect(result).toEqual(PRIVATE);
    });

    test('found', () => {

        const result = getPrivacySetting(
            {
                [FieldNames.PrivacySettings]: [
                    {
                        type: 'abc',
                        level: ASSOCIATION,
                    },
                ],
            },
            'abc',
        );

        expect(result).toEqual(ASSOCIATION);
    });

    test('found suffix', () => {

        const result = getPrivacySetting(
            {
                [FieldNames.PrivacySettings]: [
                    {
                        type: 'abc-cde',
                        level: CLUB,
                    },
                ],
            },
            'abc',
        );

        expect(result).toEqual(CLUB);
    });

    test('not set', () => {

        const result = getPrivacySetting(
            {
                [FieldNames.PrivacySettings]: [
                    {
                        type: 'abc-cde',
                        level: 'level',
                    },
                ],
            },
            'xyz',
        );

        expect(result).toEqual(PUBLIC);
    });

    test('public', () => {

        const result = getPrivacySetting(
            {
                [FieldNames.PrivacySettings]: [],
            },
            'xyz',
        );

        expect(result).toEqual(PUBLIC);
    });


    test('cache', () => {

        const record = {
            [FieldNames.PrivacySettings]: [
                {
                    type: 'abc',
                    level: ASSOCIATION,
                },
            ],
        };

        getPrivacySetting(
            record,
            'abc',
        );

        // @ts-ignore
        expect(record._PrivacySettings).not.toBeNull();
    });
});
