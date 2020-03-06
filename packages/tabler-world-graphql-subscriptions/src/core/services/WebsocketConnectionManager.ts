import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { awsGatewayClient } from '../../implementations/awsGatewayClient';
import { ClientLostError } from '../types/ClientLostError';
import { IConnection } from '../types/IConnection';
import { IConnectionStorage } from '../types/IConnectionStorage';
import { getWebsocketParams } from '../utils/getWebsocketParams';

const logger = new ConsoleLogger('ws:connection');

export class WebsocketConnectionManager<Context> {
    constructor(private storage: IConnectionStorage) {
    }

    public async get(connectionId: string): Promise<IConnection<Context> | undefined> {
        return await this.storage.get(connectionId);
    }

    public async connect(connectionId: string): Promise<void> {
        const params = getWebsocketParams();
        return await this.storage.put(
            { connectionId },
            (await params).ttlConnection,
        );
    }

    public async authorize(connectionId: string, principal: IPrincipal, context?: Context): Promise<void> {
        logger.log(`[${connectionId}]`, 'authorize', principal);

        const params = getWebsocketParams();
        return await this.storage.put(
            {
                connectionId,
                principal,
                memberId: principal.id,
                context: context || {},
            },
            (await params).ttlConnection,
        );
    }

    public async disconnect(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'disconnect');
        await this.storage.remove(connectionId);
    }

    public async sendACK(connectionId: string) {
        await this.sendMessage(
            connectionId,
            { type: MessageTypes.GQL_CONNECTION_ACK },
        );
    }

    public async sendError(connectionId: string, id: string | undefined, payload: any, type: string = MessageTypes.GQL_ERROR): Promise<void> {
        await this.sendMessage(
            connectionId,
            {
                id,
                payload,
                type,
            },
        );
    }

    /**
     * Forcibly closes the given connections
     * @param connectionId
     */
    public async forceDisconnect(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'forceDisconnect');

        const promises: Promise<any>[] = [];
        if (!EXECUTING_OFFLINE) {
            promises.push(awsGatewayClient.deleteConnection({
                ConnectionId: connectionId,
            }).promise());
        }

        promises.push(this.disconnect(connectionId));
        await Promise.all(promises);
    }

    /**
     * Sends a message to the given connection
     * @param connectionId
     * @param message
     */
    public async sendMessage(connectionId: string, message: OperationMessage): Promise<void> {
        logger.log(`[${connectionId}]`, 'send', message.type, message.id, JSON.stringify(message).substr(0, 200), '...');

        try {
            await awsGatewayClient.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify(message),
            }).promise();
        } catch (err) {
            logger.error(`[${connectionId}]`, err);

            // connection does no longeer exist
            if (err.statusCode === 410) {
                await this.disconnect(connectionId);
                throw new ClientLostError(connectionId);
            }

            throw err;
        }
    }
}
