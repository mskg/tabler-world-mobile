import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { IEventStorage, PaggedResponse, QueryOptions } from '../../core/types/IEventStorage';
import { WebsocketEvent } from '../../core/types/WebsocketEvent';
import { EVENTS_TABLE, FieldNames } from '../Constants';

const logger = new ConsoleLogger('dynamodb');

export class DynamoDBEventStorage implements IEventStorage {
    constructor(private client: DocumentClient) { }

    public async get<T>(id: string): Promise<WebsocketEvent<T> | undefined> {
        const { Item } = await this.client.get({
            Key: { id },
            TableName: EVENTS_TABLE,
        }).promise();

        return Item as WebsocketEvent<T> | undefined;
    }

    public async list<T = any>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.debug('event', trigger);

        const { Items: messages, LastEvaluatedKey: nextKey } = await this.client.query({
            TableName: EVENTS_TABLE,
            ExclusiveStartKey: options.token,
            Limit: options.pageSize,

            KeyConditionExpression: `${FieldNames.trigger} = :trigger`,
            ExpressionAttributeValues: {
                ':trigger': trigger,
            },

            // new message go on top,
            ScanIndexForward: options.forward,
        }).promise();

        logger.debug('event', trigger);

        // @ts-ignore
        return messages
            ? {
                nextKey,
                result: messages,
            }
            : undefined;
    }

    public async markDelivered(eventName: string, id: string) {
        logger.debug('markDelivered', id);

        await this.client.update({
            TableName: EVENTS_TABLE,

            Key: {
                [FieldNames.trigger]: eventName,
                [FieldNames.id]: id,
            },

            UpdateExpression: 'set delivered = :s',
            ExpressionAttributeValues: {
                ':s': true,
            },
        }).promise();
    }

    public async post<T>(events: WebsocketEvent<T>[]): Promise<void> {
        const items: [string, WriteRequest][] = events.map((message) => ([
            EVENTS_TABLE,
            {
                PutRequest: {
                    Item: message,
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Updated', item[0], item[1].PutRequest?.Item[FieldNames.id]);
        }
    }

    public async remove(eventName: string, ids: string[]): Promise<void> {
        logger.log('remove', ids);

        const items: [string, WriteRequest][] = ids.map((id) => ([
            EVENTS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.trigger]: eventName,
                        [FieldNames.id]: id,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(this.client, items)) {
            logger.debug('Removed', item[0], item[1].DeleteRequest?.Key[FieldNames.id]);
        }
    }
}
