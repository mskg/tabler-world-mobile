import { OperationMessage } from 'subscriptions-transport-ws';
import { subscriptionManager } from '../services';
import { ProtocolContext } from './ProtocolContext';

export async function gqlStop(context: ProtocolContext, operation: OperationMessage) {
    context.logger.log('gqlStop');
    await subscriptionManager.unsubscribe(context.connectionId, operation.id as string);
}
