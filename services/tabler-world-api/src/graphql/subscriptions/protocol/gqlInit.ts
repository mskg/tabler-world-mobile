import { lookupPrincipal, validateToken } from '@mskg/tabler-world-auth-client';
import { withClient } from '@mskg/tabler-world-rds-client';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { connectionManager } from '../services';
import { ClientLostError } from '../types/ClientLostError';
import { ProtocolContext } from './ProtocolContext';

export async function gqlInit(context: ProtocolContext, operation: OperationMessage) {
    context.logger.log('gqlInit');

    const { Authorization: token } = operation.payload || {};
    try {
        context.logger.log('Validating Authorization', token);
        if (!token) {
            console.log('No token provided');
            throw new Error('Unauthorized (token)');
        }

        const { email } = await validateToken(process.env.AWS_REGION as string, process.env.UserPoolId as string, token);
        context.logger.log('Found', email);

        const principal = await withClient(context.lambdaContext, (client) => lookupPrincipal(client, email));

        context.logger.log('resolved', principal);
        await connectionManager.authorize(context.connectionId, principal);

        context.logger.log('authorized');
        await connectionManager.sendACK(context.connectionId);
    } catch (e) {
        context.logger.error('Failed to authenticate connection', e);

        // if we haven't lost the client, we drop it
        if (!(e instanceof ClientLostError)) {
            await connectionManager.sendError(context.connectionId, { message: e.message }, MessageTypes.GQL_CONNECTION_ERROR);
            await connectionManager.forceDisconnect(context.connectionId);
        }
    }
}
