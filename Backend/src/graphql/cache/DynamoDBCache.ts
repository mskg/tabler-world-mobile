import { CacheOptions } from 'apollo-datasource-rest/dist/RESTDataSource';
import { KeyValueCache } from 'apollo-server-core';
import { AWSError } from 'aws-sdk';
import DynamoDB, { TableName } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import _ from 'lodash';
import { DocumentClient } from '../xray/DynamoDB';
import { CacheData, CacheValues, IManyKeyValueCache } from "./CacheTypes";

export class DynamoDBCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    client: DynamoDB.DocumentClient;

    constructor(
        serviceConfigOptions: DynamoDB.Types.ClientConfiguration,
        private tableOptions: {
            tableName: TableName,
            ttl?: number,
        },
    ) {
        this.client = new DocumentClient(serviceConfigOptions);
    }

    private addTTL(t: any, options?: CacheOptions): any {
        const ttl = options && options.ttl
            ? options.ttl
            : (this.tableOptions.ttl || 0);

        if (ttl !== 0) {
            console.log(
                "[DynamoDBCache] item", t.id, "valid for",
                Math.round(ttl / 60 / 60 * 100) / 100,
                "h");

            t["ttl"] = Math.floor(Date.now() / 1000) + ttl;
        }

        return t;
    }

    private checkTTL({ ttl, id }: { id: string, ttl?: number }): boolean {
        // never expires
        if (ttl === 0 || ttl == null) {
            console.log("[DynamoDBCache] item", id, "never expires.");
            return true;
        }

        if (ttl < Math.floor(Date.now() / 1000)) {
            console.log("[DynamoDBCache] item", id, "was expired.");
            return false;
        } else {
            console.log(
                "[DynamoDBCache] item", id, "valid for",
                Math.round((ttl - Math.floor(Date.now() / 1000)) / 60 / 60 * 100) / 100,
                "h");
        }

        return true;
    }

    private chunkSubstr(str: string, size: number): string[] {
        const numChunks = Math.ceil(str.length / size)
        const chunks = new Array(numChunks)

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size)
        }

        return chunks
    }

    public async set(
        id: string,
        data: string,
        options?: CacheOptions,
    ) {
        console.log("[DynamoDBCache] set", id, options);

        const chunks = this.chunkSubstr(data, 350 * 1024);
        if (chunks.length > 1) {
            await this.setMany([
                this.addTTL({
                    id,
                    data: "chunks:" + chunks.length,
                }, options),
                ...chunks.map((c, i) => this.addTTL({
                    id: `${id}_${i}`,
                    data: c,
                }, options))
            ]);
        } else {
            await this.client
                .put({
                    TableName: this.tableOptions.tableName,
                    Item: this.addTTL({
                        id,
                        data,
                    }, options),
                })
                .promise();
        }
    }

    public async setMany(data: CacheData<string>[]) {
        console.log("[DynamoDBCache] setMany", data.map(data => data.id).join(', '));

        const chunks = _.chunk(data, 25);
        for (let chunk of chunks) {
            let result = await this.client.batchWrite({
                RequestItems: {
                    [this.tableOptions.tableName]:
                        chunk.map(d => ({
                            PutRequest: {
                                Item: this.addTTL({
                                    id: d.id,
                                    data: d.data,
                                }, d.options)
                            }
                        }))
                }
            }).promise();

            do {
                if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
                    console.log("[DynamoDBCache] retrying write operation");

                    result = await this.client.batchWrite({
                        RequestItems: result.UnprocessedItems
                    }).promise();
                } else {
                    break;
                }
            }
            while (true);
        }
    }

    public async delete(id: string): Promise<boolean | void> {
        console.log("[DynamoDBCache] delete", id);

        await this.client.delete({
            TableName: this.tableOptions.tableName,
            Key: { id },

        }).promise();
    }

    public async getMany(ids: string[]): Promise<CacheValues> {
        console.log("[DynamoDBCache] getMany", ids.join(', '));

        const chunks = _.chunk(ids, 100);
        let result = {};

        const reduceResult = (chunkResult: PromiseResult<DynamoDB.DocumentClient.BatchGetItemOutput, AWSError>) => {
            if (chunkResult.Responses && chunkResult.Responses[this.tableOptions.tableName]) {
                chunkResult.Responses[this.tableOptions.tableName].reduce(
                    (p, c) => {
                        if (this.checkTTL(c as any)) {
                            p[c.id] = c.data;
                        }

                        return p;
                    },
                    result
                );
            }
        }

        for (let chunk of chunks) {
            let chunkResult = await this.client.batchGet({
                RequestItems: {
                    [this.tableOptions.tableName]: {
                        Keys: chunk.map(id => ({ id })),
                        AttributesToGet: ["id", "data", "ttl"],
                        ConsistentRead: false,
                    },
                }
            }).promise();

            reduceResult(chunkResult);

            do {
                if (chunkResult.UnprocessedKeys && Object.keys(chunkResult.UnprocessedKeys).length > 0) {
                    console.log("[DynamoDBCache] retrying get operation");

                    chunkResult = await this.client.batchGet({
                        RequestItems: chunkResult.UnprocessedKeys
                    }).promise();

                    reduceResult(chunkResult);
                } else {
                    break;
                }
            }
            while (true);

            if (chunkResult.UnprocessedKeys) {

            }
        }

        return result;
    }

    public async get(id: string): Promise<string | undefined> {
        console.log("[DynamoDBCache] get", id);

        const reply = await this.client
            .query({
                TableName: this.tableOptions.tableName,
                KeyConditionExpression: "#id = :value",
                ExpressionAttributeNames: {
                    "#id": "id",
                },
                ExpressionAttributeValues: {
                    ":value": id,
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
                if ((item.data as string).startsWith("chunks:")) {
                    const count = parseInt(item.data.substr("chunks:".length), 10);
                    console.log("[DynamoDBCache] found chunk", id, item.data, count);

                    const result = await this.getMany(
                        //@ts-ignore
                        Array.apply(null, {length: count}).map((_v, i) => `${id}_${i}`));

                    let finalResult = "";
                    for (let i = 0; i < count; ++i) {
                        finalResult += result[`${id}_${i}`];
                    }

                    return finalResult != "" ? finalResult : undefined;
                }

                return item.data;
            }
        }

        return undefined;
    }
}