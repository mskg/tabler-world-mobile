import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { awsGatewayClient } from '../aws/awsGatewayClient';
import { ClientLostError } from '../types/ClientLostError';
import { IConnection, IConnectionContext } from '../types/IConnection';
import { getWebsocketParams } from '../utils/getWebsocketParams';
import { FieldNames } from './Constants';
import { IConnectionStorage } from './IConnectionStorage';

const logger = new ConsoleLogger('Connection');

export class WebsocketConnectionManager {
    constructor(private storage: IConnectionStorage) {
    }

    public async get(connectionId: string): Promise<IConnection | undefined> {
        return await this.storage.get(connectionId);
    }

    public async connect(connectionId: string): Promise<void> {
        const params = getWebsocketParams();
        return await this.storage.put(
            { connectionId },
            (await params).ttlConnection,
        );
    }

    public async authorize(connectionId: string, member: IPrincipal, details: IConnectionContext): Promise<void> {
        logger.log(`[${connectionId}]`, 'authorize', member);

        const params = getWebsocketParams();
        return await this.storage.put(
            {
                connectionId,
                [FieldNames.member]: member.id,
                [FieldNames.principal]: member,
                [FieldNames.context]: details,
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

    public async sendError(connectionId: string, payload: any, type: string = MessageTypes.GQL_ERROR): Promise<void> {
        await this.sendMessage(
            connectionId,
            {
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
        logger.log(`[${connectionId}]`, 'send', JSON.stringify(message));

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
