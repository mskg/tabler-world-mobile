import { resolveWebsocketPrincipal } from '@mskg/tabler-world-auth-client';
import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { createHash } from 'crypto';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { cacheInstance } from '../../cache/cacheInstance';
import { extractVersion } from '../../helper/extractVersion';
import { connectionManager } from '../services';
import { ClientLostError } from '../types/ClientLostError';
import { ProtocolContext } from './ProtocolContext';

function hash(address?: string) {
    if (!address) return null;

    return createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest('hex');
}

export async function gqlInit(context: ProtocolContext, operation: OperationMessage) {
    context.logger.log('gqlInit');

    try {
        // @ts-ignore
        const { Authorization: token } = operation.payload;

        const principal = await cachedLoad(
            {
                logger: context.logger,
                cache: cacheInstance,
            },
            makeCacheKey('Principal', [hash(token) || context.connectionId]),
            () => resolveWebsocketPrincipal(operation),
            'Principal',
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
                connectionManager.sendError(context.connectionId, undefined, { message: e.message }, MessageTypes.GQL_CONNECTION_ERROR),
                connectionManager.forceDisconnect(context.connectionId),
            ]);
        }
    }
}
