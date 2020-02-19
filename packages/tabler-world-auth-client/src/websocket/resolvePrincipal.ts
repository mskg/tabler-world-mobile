import { IDataService } from '@mskg/tabler-world-rds-client';
import { AuthenticationError } from 'apollo-server-core';
import { validateToken } from '../cognito/validateToken';
import { isDebugMode } from '../debug/isDebugMode';
import { resolveDebugPrincipal } from '../debug/resolveDebugPrincipal';
import { Environment } from '../Environment';
import { lookupPrincipal } from '../sql/lookupPrincipal';
import { IPrincipal } from '../types/IPrincipal';

type ResolverFunc = (email: string) => Promise<IPrincipal>;
type ClientType = IDataService | ResolverFunc;

/**
 * Resolves the principal from the given WebSocket operation payload.
 *
 * @param operation
 * @param client Either the default database client or a custom cache function
 */
export async function resolvePrincipal(
    operation: { payload?: any },
    client: ClientType,
) {
    const payload = operation.payload || {};
    let principal: IPrincipal;

    if (isDebugMode()) {
        console.warn(`********* AUTHENTICATION DEBUG MODE *********`);
        principal = resolveDebugPrincipal(payload);
    } else {
        const { Authorization: token } = payload;

        if (!token) {
            console.log('No token provided');
            throw new AuthenticationError('Unauthorized (token)');
        }

        const { email } = await validateToken(Environment.AWS_REGION as string, Environment.USERPOOL_ID as string, token);

        // we don't need additional validations here this is already the original function
        principal = typeof (client) === 'function'
            ? await client(email)
            : await lookupPrincipal(client, email);
    }

    return principal;
}
