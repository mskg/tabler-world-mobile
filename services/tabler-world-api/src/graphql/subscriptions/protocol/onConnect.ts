import { connectionManager } from '../services';
import { ProtocolContext } from './ProtocolContext';

export async function onConnect(context: ProtocolContext) {
    context.logger.log('onConnect');

    await connectionManager.connect(context.connectionId);
}
