import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import client from '../aws/dynamodb';
import gatewayClient from '../aws/gatewayClient';
import { CONNECTIONS_TABLE, FieldNames } from '../utils/tables';
import { WebSocketLogger } from '../utils/WebSocketLogger';
import { IConnection } from './IConnection';

const logger = new WebSocketLogger('ConnectionManager');

export class WebSocketConnectionManager {
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

    public async connect(connectionId: string, member: IPrincipal): Promise<void> {
        logger.log(`[${connectionId}]`, 'connect', member);

        await client.put({
            TableName: CONNECTIONS_TABLE,

            Item: {
                [FieldNames.connectionId]: connectionId,
                [FieldNames.member]: member.id,
                [FieldNames.principal]: member,
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
        this.sendMessage(connectionId, { type: MessageTypes.GQL_CONNECTION_ACK });
    }

    public async sendError(connectionId: string, payload: any): Promise<void> {
        await this.sendMessage(
            connectionId,
            {
                payload,
                type: MessageTypes.GQL_ERROR,
            },
        );
    }

    public async sendMessage(connectionId: string, message: OperationMessage): Promise<void> {
        logger.log(`[${connectionId}]`, 'send', message);

        await gatewayClient.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message),
        }).promise();
    }
}
