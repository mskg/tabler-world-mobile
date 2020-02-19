import { IDataService } from '@mskg/tabler-world-rds-client';
import { Family } from '../types/Family';
import { lookupPrincipal } from './lookupPrincipal';

// @ts-ignore
// tslint:disable: no-for-in forin
// tslint:disable: mocha-no-side-effect-code


const rawData = {
    family: Family.RTI,
    area: 'aree',
    club: 'club',
    association: 'association',
    roles: ['role1', 'role2'],
    id: 1,
    email: 'email',
};

const principal = {
    ...rawData,
    version: '1.2',
};


const clientMock = {
    query: jest.fn((str, args) => {
        expect(str).toContain('profiles');
        expect(args).toContain('email');

        return Promise.resolve({
            rowCount: 1,
            rows: [rawData],
        });
    }),
};

beforeEach(() => {
    clientMock.query.mockClear();
});

describe('resolvePrincipal', () => {
    test('success', async () => {
        const result = await lookupPrincipal(clientMock as unknown as IDataService, 'email');
        expect(result).toEqual(principal);
    });

    test('fail 0', async () => {
        clientMock.query.mockResolvedValueOnce(Promise.resolve({
            rowCount: 0,
            rows: [],
        }));

        let e;

        try {
            await lookupPrincipal(clientMock as unknown as IDataService, 'email');
        } catch (err) {
            e = err;
        }

        expect(e).toBeInstanceOf(Error);
    });

    test('fail > 1', async () => {
        clientMock.query.mockResolvedValueOnce(Promise.resolve({
            rowCount: 2,
            rows: [rawData, rawData],
        }));

        let e;

        try {
            await lookupPrincipal(clientMock as unknown as IDataService, 'email');
        } catch (err) {
            e = err;
        }

        expect(e).toBeInstanceOf(Error);
    });
});
