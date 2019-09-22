import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { OperationMessage, OperationMessagePayload } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import client from '../aws/dynamodb';
import gatewayClient from '../aws/gatewayClient';
import { CONNECTIONS_TABLE, FieldNames } from '../utils/tables';

export interface IConnection {
    connectionId: string;

    memberId: number;
    principal: IPrincipal;

    // subscriptionId?: string,
    payload?: OperationMessagePayload;
}

export class ConnectionManager {

    public async get(connectionId: string): Promise<IConnection> {
        const { Item: details } = await client.get({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();

        return details as IConnection;
    }

    public async connect(connectionId: string, member: IPrincipal): Promise<void> {
        console.log('[ConnectionManager] [connect]', connectionId, member);

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
        console.log('[ConnectionManager] [disconnect]', connectionId);

        await client.delete({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();
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
        console.log('[ConnectionManager] [send]', connectionId, message);

        await gatewayClient.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message),
        }).promise();
    }
}
