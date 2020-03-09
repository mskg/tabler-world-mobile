import { ProtocolContext } from './ProtocolContext';

export async function onConnect(context: ProtocolContext) {
    context.logger.debug('onConnect');
    await context.serverContext.connectionManager.connect(context.connectionId);
}
