import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { IConnection } from '../../types/IConnection';
import { ConnectionDetails, IConnectionStorage } from '../../types/IConnectionStorage';
import { FieldNames } from './FieldNames';

const logger = new ConsoleLogger('dynamodb');

export class DynamoDBConnectionStore implements IConnectionStorage {
    constructor(private tableName: string, private client: DocumentClient) {
    }

    public async get(connectionId: string): Promise<IConnection> {
        logger.debug(`[${connectionId}]`, 'get');

        const { Item: details } = await this.client.get({
            TableName: this.tableName,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();

        return details as IConnection;
    }

    public async put(data: ConnectionDetails, ttl: number): Promise<void> {
        logger.debug(`[${data.connectionId}]`, 'put', data);

        await this.client.put({
            TableName: this.tableName,

            Item: {
                ...data,
                ttl: Math.floor(Date.now() / 1000) + ttl,
            } as IConnection,

        }).promise();
    }

    public async remove(connectionId: string): Promise<void> {
        logger.debug(`[${connectionId}]`, 'disconnect');

        await this.client.delete({
            TableName: this.tableName,
            Key: {
                [FieldNames.connectionId]: connectionId,
            },
        }).promise();
    }
}
