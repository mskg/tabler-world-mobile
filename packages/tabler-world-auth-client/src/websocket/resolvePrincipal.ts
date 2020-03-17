import { xAWS } from '@mskg/tabler-world-aws';
import { AuthenticationError } from 'apollo-server-core';
import { isDebugMode } from '../debug/isDebugMode';
import { resolveDebugPrincipal } from '../debug/resolveDebugPrincipal';
import { Environment } from '../Environment';
import { IPrincipal } from '../types/IPrincipal';

const lambda: AWS.Lambda = new xAWS.Lambda();

/**
 * Resolves the principal from the given WebSocket operation payload.
 *
 * @param operation
 * @param client Either the default database client or a custom cache function
 */
export async function resolvePrincipal(
    operation: { payload?: any },
) {
    const payload = operation.payload || {};
    let principal: IPrincipal;

    if (isDebugMode()) {
        console.warn(`********* AUTHENTICATION DEBUG MODE **    *******`);
        principal = resolveDebugPrincipal(payload);
    } else {
        const { Authorization: token } = payload;

        if (!token) {
            console.log('No token provided');
            throw new AuthenticationError('Unauthorized (token)');
        }

        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName: Environment.VALIDATE_ARN as string,

            InvocationType: 'RequestResponse',
            LogType: 'Tail',

            Payload: JSON.stringify(token),
        };

        const result = await lambda.invoke(lambdaParams).promise();

        // IPrincipal
        principal = JSON.parse(result.Payload as string);
    }

    return principal;
}
