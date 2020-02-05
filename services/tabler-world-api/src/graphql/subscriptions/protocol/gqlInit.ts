import { lookupPrincipal, resolveWebsocketPrincipal } from '@mskg/tabler-world-auth-client';
import { cachedLoad } from '@mskg/tabler-world-cache';
import { useDataService } from '@mskg/tabler-world-rds-client';
import crypto from 'crypto';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { cacheInstance } from '../../cache/cacheInstance';
import { extractVersion } from '../../helper/extractVersion';
import { connectionManager } from '../services';
import { ClientLostError } from '../types/ClientLostError';
import { ProtocolContext } from './ProtocolContext';

function hash(address: string) {
    return crypto
        .createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest('hex');
}

export async function gqlInit(context: ProtocolContext, operation: OperationMessage) {
    context.logger.log('gqlInit');

    try {
        const principal = await resolveWebsocketPrincipal(
            operation,
            (email: string) =>
                cachedLoad(
                    {
                        logger: context.logger,
                        cache: cacheInstance,
                    },
                    `principal::${hash(email)}`,
                    () => useDataService(
                        context,
                        (client) => lookupPrincipal(client, email),
                    ),
                    'Principal',
                ),
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
