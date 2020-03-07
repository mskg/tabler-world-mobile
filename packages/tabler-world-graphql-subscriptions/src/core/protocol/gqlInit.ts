import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { ClientLostError } from '../types/ClientLostError';
import { ProtocolContext } from './ProtocolContext';

export async function gqlInit(context: ProtocolContext, operation: OperationMessage) {
    const { connectionManager } = context.serverContext;
    context.logger.debug('gqlInit');

    try {
        const authContext = await context.serverContext.onAuthenticate(operation.payload);
        context.logger.log('resolved', authContext.principal);

        await connectionManager.authorize(
            context.connectionId,
            authContext.principal,
            authContext.extraInfo,
        );

        context.logger.log('authorized');
        await connectionManager.sendACK(context.connectionId);
    } catch (e) {
        context.logger.error('Failed to authenticate connection', e);

        // if we haven't lost the client, we drop it
        if (!(e instanceof ClientLostError)) {
            Promise.all([
                connectionManager.sendError(context.connectionId, undefined, { message: e.message }, MessageTypes.GQL_CONNECTION_ERROR),
                connectionManager.forceDisconnect(context.connectionId),
            ]);
        }
    }
}
