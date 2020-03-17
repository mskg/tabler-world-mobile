import { OperationMessage } from 'subscriptions-transport-ws';
import { ProtocolContext } from './ProtocolContext';

export async function gqlStop(context: ProtocolContext, operation: OperationMessage) {
    context.logger.debug('gqlStop');
    await context.serverContext.subscriptionManager.unsubscribe(context.connectionId, operation.id as string);
}
