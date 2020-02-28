import { connectionManager, subscriptionManager } from '../services';
import { ProtocolContext } from './ProtocolContext';

export async function onDisconnect(context: ProtocolContext) {
    context.logger.debug('onDisconnect');

    await Promise.all([
        subscriptionManager.unsubscribeAll(context.connectionId),
        connectionManager.disconnect(context.connectionId),
    ]);
}
