import { DocumentClient } from '@mskg/tabler-world-aws';
import { KeyValueCache } from 'apollo-server-core';
import { chunk } from 'lodash';
import { CacheData, CacheValues, ICacheOptions, IManyKeyValueCache } from './types';

type PromiseResult<D, E> = D & { $response: AWS.Response<D, E> };

export class DynamoDBCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    private client: AWS.DynamoDB.DocumentClient;

    constructor(
        serviceConfigOptions: AWS.DynamoDB.Types.ClientConfiguration,
        private tableOptions: {
            tableName: AWS.DynamoDB.TableName,
            ttl?: number,
        },
    ) {
        this.client = new DocumentClient(serviceConfigOptions);
    }

    public async set(
        id: string,
        data: string,
        options?: ICacheOptions,
    ) {
        console.log('[DynamoDBCache] set', id, options);

        const chunks = this.chunkSubstr(data, 350 * 1024);
        if (chunks.length > 1) {
            await this.setMany([
                {
                    id,
                    options,
                    data: `chunks:${chunks.length}`,
                },
                ...chunks.map(
                    (c, i) => ({
                        options,
                        id: `${id}_${i}`,
                        data: c,
                    }),
                ),
            ]);
        } else {
            await this.client
                .put({
                    TableName: this.tableOptions.tableName,
                    Item: this.addTTL(
                        {
                            id,
                            data,
                        },
                        options,
                    ),
                })
                .promise();
        }
    }

    public async setMany(data: CacheData<string>[]) {
        console.log('[DynamoDBCache] setMany', data.map((d) => d.id).join(', '));

        const chunks = chunk(data, 25);
        for (const c of chunks) {
            let result = await this.client.batchWrite({
                RequestItems: {
                    [this.tableOptions.tableName]:
                        c.map((d) => ({
                            PutRequest: {
                                Item: this.addTTL(
                                    {
                                        id: d.id,
                                        data: d.data,
                                    },
                                    d.options,
                                ),
                            },
                        })),
                },
            }).promise();

            do {
                if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
                    console.log('[DynamoDBCache] retrying write operation');

                    result = await this.client.batchWrite({
                        RequestItems: result.UnprocessedItems,
                    }).promise();
                } else {
                    break;
                }
            }
            // tslint:disable-next-line: no-constant-condition
            while (true);
        }
    }

    public async delete(id: string): Promise<boolean | void> {
        console.log('[DynamoDBCache] delete', id);

        await this.client.delete({
            TableName: this.tableOptions.tableName,
            Key: { id },

        }).promise();
    }

    public async getMany(ids: string[]): Promise<CacheValues> {
        console.log('[DynamoDBCache] getMany', ids.join(', '));

        const chunks = chunk(ids, 100);
        const result = {};

        const reduceResult = (chunkResult: PromiseResult<AWS.DynamoDB.DocumentClient.BatchGetItemOutput, AWS.AWSError>) => {
            if (chunkResult.Responses && chunkResult.Responses[this.tableOptions.tableName]) {
                chunkResult.Responses[this.tableOptions.tableName].reduce(
                    (p, c) => {
                        if (this.checkTTL(c as any)) {
                            p[c.id] = c.data;
                        }

                        return p;
                    },
                    result,
                );
            }
        };

        for (const c of chunks) {
            let chunkResult = await this.client.batchGet({
                RequestItems: {
                    [this.tableOptions.tableName]: {
                        Keys: c.map((id) => ({ id })),
                        AttributesToGet: ['id', 'data', 'ttl'],
                        ConsistentRead: false,
                    },
                },
            }).promise();

            reduceResult(chunkResult);

            do {
                if (chunkResult.UnprocessedKeys && Object.keys(chunkResult.UnprocessedKeys).length > 0) {
                    console.log('[DynamoDBCache] retrying get operation');

                    chunkResult = await this.client.batchGet({
                        RequestItems: chunkResult.UnprocessedKeys,
                    }).promise();

                    reduceResult(chunkResult);
                } else {
                    break;
                }
            }
            // tslint:disable-next-line: no-constant-condition
            while (true);
        }

        return result;
    }

    public async get(id: string): Promise<string | undefined> {
        console.log('[DynamoDBCache] get', id);

        const reply = await this.client
            .query({
                TableName: this.tableOptions.tableName,
                KeyConditionExpression: '#id = :value',
                ExpressionAttributeNames: {
                    '#id': 'id',
                },
                ExpressionAttributeValues: {
                    ':value': id,
                },
            })
            .promise();

        if (
            reply &&
            reply.Items &&
            reply.Items[0]
        ) {
            const item = reply.Items[0];
            if (this.checkTTL(item as any)) {
                if ((item.data as string).startsWith('chunks:')) {
                    const count = parseInt(item.data.substr('chunks:'.length), 10);
                    console.log('[DynamoDBCache] found chunk', id, item.data, count);

                    const result = await this.getMany(
                        // @ts-ignore
                        // tslint:disable-next-line: variable-name
                        Array.apply(null, { length: count }).map((_v, i) => `${id}_${i}`));

                    let finalResult = '';
                    // tslint:disable-next-line: no-increment-decrement
                    for (let i = 0; i < count; ++i) {
                        finalResult += result[`${id}_${i}`];
                    }

                    return finalResult !== '' ? finalResult : undefined;
                }

                return item.data;
            }
        }

        return undefined;
    }

    private addTTL(t: any, options?: ICacheOptions): any {
        const ttl = options && options.ttl != null
            ? options.ttl
            : (this.tableOptions.ttl || 0);

        if (ttl !== 0) {
            console.log(
                '[DynamoDBCache] item', t.id, 'valid for',
                Math.round(ttl / 60 / 60 * 100) / 100,
                'h');

            t.ttl = Math.floor(Date.now() / 1000) + ttl;
        }

        return t;
    }

    private checkTTL({ ttl, id }: { id: string, ttl?: number }): boolean {
        // never expires
        if (ttl === 0 || ttl == null) {
            console.log('[DynamoDBCache] item', id, 'never expires.');
            return true;
        }

        if (ttl < Math.floor(Date.now() / 1000)) {
            console.log('[DynamoDBCache] item', id, 'was expired.');
            return false;
        }
        console.log(
            '[DynamoDBCache] item', id, 'valid for',
            Math.round((ttl - Math.floor(Date.now() / 1000)) / 60 / 60 * 100) / 100,
            'h');


        return true;
    }

    private chunkSubstr(str: string, size: number): string[] {
        const numChunks = Math.ceil(str.length / size);
        // tslint:disable-next-line: prefer-array-literal
        const chunks = new Array(numChunks);

        // tslint:disable-next-line: no-increment-decrement
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }

        return chunks;
    }
}
