import client from '../aws/dynamodb';
import { CONNECTIONS_TABLE, FieldNames } from '../utils/tables';
import { IConnection } from './ConnectionManager';

interface ISubscription {
    connection: IConnection;
    subscriptionId: string;
}

export class SubscriptionManager {
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
        console.log('[SubscriptionManager] [subscribe]', connectionId, subscriptionId, payload);

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
        console.log('[SubscriptionManager] [unsubscribe]', connectionId);

        await client.update({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },

            UpdateExpression: `REMOVE ${FieldNames.subscriptionId}, ${FieldNames.payload}`,
        }).promise();
    }
}
