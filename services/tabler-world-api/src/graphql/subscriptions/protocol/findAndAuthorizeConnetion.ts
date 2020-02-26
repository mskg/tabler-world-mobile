import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { connectionManager } from '../services';
import { IConnection } from '../types/IConnection';
import { ProtocolContext } from './ProtocolContext';

export async function findAndAuthorizeConnetion(context: ProtocolContext): Promise<IConnection | null> {
    context.logger.log('findAndAuthorize');

    const details = await connectionManager.get(context.connectionId);
    if (!details || !details.principal) {
        context.logger.error('Unkown client', context.connectionId);

        await connectionManager.sendError(context.connectionId, undefined, { message: 'Unknown client' }, MessageTypes.GQL_ERROR);
        await connectionManager.forceDisconnect(context.connectionId);

        return null;
    }

    context.logger.log('findAndAuthorize ok');
    return details;
}
