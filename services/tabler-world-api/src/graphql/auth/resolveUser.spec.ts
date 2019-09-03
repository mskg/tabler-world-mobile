import { APIGatewayProxyEvent } from 'aws-lambda';
import { resolveUser } from './resolveUser';

// @ts-ignore
// tslint:disable: no-for-in forin
// tslint:disable: mocha-no-side-effect-code

const baseCtx = {
    requestContext: {
        authorizer: {
            area: 1,
            club: 2,
            association: 'association',
            id: 3,
            email: 'email',
        },
    },
} as APIGatewayProxyEvent;

describe('Authorizer', () => {
    function create(id: string) {
        const ctx = JSON.parse(JSON.stringify(baseCtx));
        // @ts-ignore
        delete ctx.requestContext.authorizer[id];

        return () => resolveUser(ctx);
    }

    for (const key in baseCtx.requestContext.authorizer) {
        test(key, () => {
            expect(create(key)).toThrowError(/Authorizer/);
        });
    }
});

describe('IPrincipal', () => {
    for (const key in baseCtx.requestContext.authorizer) {
        test(key, () => {
            const ctx = JSON.parse(JSON.stringify(baseCtx));
            const result = resolveUser(ctx);

            // @ts-ignore
            expect(result[key]).toEqual(ctx.requestContext.authorizer[key]);
        });
    }
});
