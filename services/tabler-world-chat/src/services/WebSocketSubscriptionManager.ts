import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import client from '../aws/dynamodb';
import { CONNECTIONS_TABLE, FieldNames } from '../utils/tables';
import { WebSocketLogger } from '../utils/WebSocketLogger';
import { IConnection } from "./IConnection";
import { WebSocketConnectionManager } from './WebsocketConnectionManager';

interface ISubscription {
    connection: IConnection;
    subscriptionId: string;
}

const logger = new WebSocketLogger('SubscriptionManager');

export class WebSocketSubscriptionManager {
    constructor(private connection: WebSocketConnectionManager) {
    }

    public async getAllForPrincipal(memberId: number): Promise<ISubscription[]> {
        const { Items: clients } = await client.query({
            ExpressionAttributeValues: {
                ':member': memberId,
            },
            IndexName: 'reverse',
            KeyConditionExpression: `${FieldNames.member} = :member`,
            ProjectionExpression: `${FieldNames.connectionId}, ${FieldNames.subscriptionId}, ${FieldNames.payload}, ${FieldNames.principal}`,
            TableName: CONNECTIONS_TABLE,
        }).promise();

        return clients
            ? clients.map((c) => ({
                connection: {
                    memberId,
                    connectionId: c[FieldNames.connectionId],
                    payload: c[FieldNames.payload],
                    principal: c[FieldNames.principal],
                },
                subscriptionId: c[FieldNames.subscriptionId],
            } as ISubscription))
            : [];
    }

    public async subscribe(connectionId: string, subscriptionId: string, payload: any): Promise<void> {
        logger.log(`[${connectionId}] [${subscriptionId}]`, 'subscribe', payload);

        await client.update({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },

            UpdateExpression: `SET ${FieldNames.subscriptionId} = :s, ${FieldNames.payload} = :p`,
            ExpressionAttributeValues: {
                ':s': subscriptionId,
                ':p': payload,
            },
        }).promise();
    }

    public async unsubscribe(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'unsubscribe');

        await client.update({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },

            UpdateExpression: `REMOVE ${FieldNames.subscriptionId}, ${FieldNames.payload}`,
        }).promise();
    }

    public async sendData(connectionId: string, subscriptionId: string, payload: any): Promise<void> {
        await this.connection.sendMessage(
            connectionId,
            {
                payload,
                id: subscriptionId,
                type: MessageTypes.GQL_DATA,
            },
        );
    }
}
