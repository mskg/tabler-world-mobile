import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { IConnection } from '../../types/IConnection';
import { CONNECTIONS_TABLE, FieldNames } from '../Constants';
import { ConnectionDetails, IConnectionStorage } from '../IConnectionStorage';

const logger = new ConsoleLogger('DynamoDB');

export class DynamoDBConnectionStore implements IConnectionStorage {
    constructor(private client: DocumentClient) {
    }

    public async get(connectionId: string): Promise<IConnection> {
        logger.log(`[${connectionId}]`, 'get');

        const { Item: details } = await this.client.get({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();

        return details as IConnection;
    }

    public async put(data: ConnectionDetails, ttl: number): Promise<void> {
        logger.log(`[${data.connectionId}]`, 'put', data);

        await this.client.put({
            TableName: CONNECTIONS_TABLE,

            Item: {
                ...data,
                ttl: Math.floor(Date.now() / 1000) + ttl,
            } as IConnection,

        }).promise();
    }

    public async remove(connectionId: string): Promise<void> {
        logger.log(`[${connectionId}]`, 'disconnect');

        await this.client.delete({
            TableName: CONNECTIONS_TABLE,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();
    }
}
