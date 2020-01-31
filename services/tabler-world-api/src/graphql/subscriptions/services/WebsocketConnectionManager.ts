import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { awsGatewayClient } from '../aws/awsGatewayClient';
import { dynamodb as client } from '../aws/dynamodb';
import { ClientLostError } from '../types/ClientLostError';
import { IConnection, IConnectionContext } from '../types/IConnection';
import { getWebsocketParams } from '../utils/getWebsocketParams';
import { CONNECTIONS_TABLE, FieldNames } from './Constants';

const logger = new ConsoleLogger('Connection');

export class WebsocketConnectionManager {
    public async get(connectionId: string): Promise<IConnection> {
        logger.log(`[${connectionId}]`, 'get');

        const { Item: details } = await client.get({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();

        return details as IConnection;
    }

    public async connect(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'connect');

        const params = getWebsocketParams();
        await client.put({
            TableName: CONNECTIONS_TABLE,

            Item: {
                [FieldNames.connectionId]: connectionId,
                ttl: Math.floor(Date.now() / 1000) + (await params).ttlConnection,
            },

        }).promise();
    }

    public async authorize(connectionId: string, member: IPrincipal, details: IConnectionContext): Promise<void> {
        logger.log(`[${connectionId}]`, 'authorize', member);

        const params = getWebsocketParams();
        await client.put({
            TableName: CONNECTIONS_TABLE,

            Item: {
                [FieldNames.connectionId]: connectionId,
                [FieldNames.member]: member.id,
                [FieldNames.principal]: member,
                [FieldNames.context]: details,
                ttl: Math.floor(Date.now() / 1000) + (await params).ttlConnection,
            } as IConnection,

        }).promise();
    }

    public async disconnect(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'disconnect');

        await client.delete({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();
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
