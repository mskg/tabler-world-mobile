import { ProtocolContext } from './ProtocolContext';

export async function onDisconnect(context: ProtocolContext) {
    context.logger.debug('onDisconnect');

    await Promise.all([
        context.serverContext.subscriptionManager.unsubscribeAll(context.connectionId),
        context.serverContext.connectionManager.disconnect(context.connectionId),
    ]);
}
