import { IPrincipal, lookupPrincipal, validateToken } from '@mskg/tabler-world-auth-client';
import { withClient } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';

const UNAUTHORIZED = 'Unauthorized';

// tslint:disable-next-line: export-name
export const handler: Handler<string, string> = async (event, context) => {
    const token = event;
    if (!token) {
        console.log('No token provided');

        throw UNAUTHORIZED;
    }

    let email: string;

    try {
        const result = await validateToken(
            process.env.AWS_REGION as string,
            process.env.USERPOOL_ID as string,
            token,
        );

        email = result.email;
    } catch (e) {
        console.error(e);
        throw UNAUTHORIZED;
    }

    // may result in 500 if DB fails - which is ok
    return await withClient(context, async (client) => {
        let principal: IPrincipal;
        try {
            principal = await lookupPrincipal(client, email);
        } catch (e) {
            console.error(e);
            throw UNAUTHORIZED;
        }

        return JSON.stringify(principal);
    });
};
