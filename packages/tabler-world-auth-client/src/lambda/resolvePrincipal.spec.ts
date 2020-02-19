import { AuthenticationError } from 'apollo-server-core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Family } from '../types/Family';
import { resolvePrincipal } from './resolvePrincipal';

// @ts-ignore
// tslint:disable: no-for-in forin
// tslint:disable: mocha-no-side-effect-code

const oldBaseCtx = {
    requestContext: {
        authorizer: {
            area: 'aree',
            club: 'club',
            association: 'association',

            id: 1,
            email: 'email',
        },
    },
} as unknown as APIGatewayProxyEvent;

const newBaseCtx = {
    requestContext: {
        authorizer: {
            version: '1.2',

            family: Family.RTI,
            area: 'aree',
            club: 'club',
            association: 'association',

            id: 1,
            email: 'email',
        },
    },
} as unknown as APIGatewayProxyEvent;

const clientMock = {
    query: jest.fn((str, args) => {
        expect(str).toContain('profiles');
        expect(args).toContain('email');

        return Promise.resolve({
            rowCount: 1,
            rows: [newBaseCtx.requestContext.authorizer],
        });
    }),
};

beforeEach(() => {
    clientMock.query.mockClear();
});

describe('Old Authorizer', () => {
    function create(id: string) {
        const ctx = JSON.parse(JSON.stringify(oldBaseCtx));
        // @ts-ignore
        delete ctx.requestContext.authorizer[id];

        // @ts-ignore
        return resolvePrincipal(clientMock, ctx);
    }

    for (const key in oldBaseCtx.requestContext.authorizer) {

        test(key, async () => {
            let e;

            try {
                await create(key);
            } catch (err) {
                e = err;
            }

            expect(e).toBeInstanceOf(AuthenticationError);
        });
    }
});

describe('Old IPrincipal', () => {
    for (const key in oldBaseCtx.requestContext.authorizer) {

        test(key, async () => {
            const ctx = JSON.parse(JSON.stringify(oldBaseCtx));

            // @ts-ignore
            const result = await resolvePrincipal(clientMock, ctx);

            // @ts-ignore
            expect(result[key]).toEqual(ctx.requestContext.authorizer[key]);
            expect(clientMock.query).toHaveBeenCalled();
        });
    }
});

describe('New Authorizer', () => {
    function create(id: string) {
        const ctx = JSON.parse(JSON.stringify(newBaseCtx));
        // @ts-ignore
        delete ctx.requestContext.authorizer[id];

        // @ts-ignore
        return resolvePrincipal(clientMock, ctx);
    }

    for (const key in newBaseCtx.requestContext.authorizer) {
        if (key === 'version') continue;

        test(key, async () => {
            let e;

            try {
                await create(key);
            } catch (err) {
                e = err;
            }

            expect(e).toBeInstanceOf(AuthenticationError);
        });
    }
});

describe('New IPrincipal', () => {
    for (const key in oldBaseCtx.requestContext.authorizer) {
        if (key === 'version') continue;

        test(key, async () => {

            const ctx = JSON.parse(JSON.stringify(newBaseCtx));

            // @ts-ignore
            const result = await resolvePrincipal(clientMock, ctx);

            // @ts-ignore
            expect(result[key]).toEqual(ctx.requestContext.authorizer[key]);
            expect(clientMock.query).toHaveBeenCalledTimes(0);
        });
    }
});
