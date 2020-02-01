import { resolveWebsocketPrincipal } from '@mskg/tabler-world-auth-client';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { extractVersion } from '../../helper/extractVersion';
import { connectionManager } from '../services';
import { ClientLostError } from '../types/ClientLostError';
import { ProtocolContext } from './ProtocolContext';

export async function gqlInit(context: ProtocolContext, operation: OperationMessage) {
    context.logger.log('gqlInit');

    try {
        const principal = await useDataService(
            context,
            (client) => resolveWebsocketPrincipal(client, operation),
        );

        context.logger.log('resolved', principal);
        await connectionManager.authorize(
            context.connectionId,
            principal,
            { version: extractVersion(operation.payload || {}) },
        );

        context.logger.log('authorized');
        await connectionManager.sendACK(context.connectionId);
    } catch (e) {
        context.logger.error('Failed to authenticate connection', e);

        // if we haven't lost the client, we drop it
        if (!(e instanceof ClientLostError)) {
            Promise.all([
                connectionManager.sendError(context.connectionId, { message: e.message }, MessageTypes.GQL_CONNECTION_ERROR),
                connectionManager.forceDisconnect(context.connectionId),
            ]);
        }
    }
}
