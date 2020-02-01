import { IDataService } from '@mskg/tabler-world-rds-client';
import { AuthenticationError } from 'apollo-server-core';
import { OperationMessage } from 'subscriptions-transport-ws';
import { validateToken } from '../cognito/validateToken';
import { isDebugMode } from '../debug/isDebugMode';
import { resolveDebugPrincipal } from '../debug/resolveDebugPrincipal';
import { lookupPrincipal } from '../sql/lookupPrincipal';
import { IPrincipal } from '../types/IPrincipal';

export async function resolvePrincipal(client: IDataService, operation: OperationMessage) {
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

        const { email } = await validateToken(process.env.AWS_REGION as string, process.env.UserPoolId as string, token);

        // we don't need additional validations here this is already the original function
        principal = await lookupPrincipal(client, email);
    }

    return principal;
}
