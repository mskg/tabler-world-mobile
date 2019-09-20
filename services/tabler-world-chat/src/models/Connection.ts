import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import client from '../aws/dynamodb';
import gatewayClient from '../aws/gatewayClient';
import { CONNECTIONS_TABLE, FieldNames } from '../utils/tables';

type SubscriptionDetails = {
    connectionId: string,
    memberId: number,
    details: IPrincipal,
    subscriptionId?: string,
};

export class Connection {
    private details?: SubscriptionDetails;

    constructor(public connectionId: string) {
    }

    public async get(): Promise<SubscriptionDetails> {
        if (this.details != null) return this.details;

        const { Item } = await client.get({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: this.connectionId,
            },
        }).promise();

        this.details = Item as SubscriptionDetails;
        return this.details;
    }

    public async subscribe(subscriptionId: string) {
        console.log('[subscribe]', this.connectionId, subscriptionId);

        return client.update({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: this.connectionId,
            },

            UpdateExpression: 'SET subscriptionId = :s',
            ExpressionAttributeValues: {
                ':s': subscriptionId,
            },
        }).promise();
    }

    public async unsubscribe() {
        console.log('[unsubscribe]', this.connectionId);

        return client.update({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: this.connectionId,
            },

            UpdateExpression: 'REMOVE subscriptionId',
        }).promise();
    }

    public async connect(member: IPrincipal) {
        console.log('[connect]', this.connectionId, member);

        return client.put({
            TableName: CONNECTIONS_TABLE,

            Item: {
                [FieldNames.connectionId]: this.connectionId,
                [FieldNames.member]: member.id,
                details: member,
            } as SubscriptionDetails,

        }).promise();
    }

    public async disconnect() {
        console.log('[disconnect]', this.connectionId);

        return client.delete({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: this.connectionId,
            },
        }).promise();
    }

    public async sendError(payload: any) {
        return this.sendMessage({
            payload,
            type: MessageTypes.GQL_ERROR,
        });
    }

    public async sendMessage(message: OperationMessage) {
        console.log('[send]', this.connectionId, message);

        return gatewayClient.postToConnection({
            ConnectionId: this.connectionId,
            Data: JSON.stringify(message),
        }).promise();
    }
}
