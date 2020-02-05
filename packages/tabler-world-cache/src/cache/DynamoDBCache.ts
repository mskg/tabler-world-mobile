import { BatchGet, BatchWrite, DocumentClient, WriteRequest } from '@mskg/tabler-world-aws';
import { ILogger } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-core';
import { CacheData, CacheValues, ICacheOptions, IManyKeyValueCache } from './types';

type VersionedCacheData<T> = {
    id: string,
    ttl?: number,
    version?: string,
    data: T,
};

const CHUNKS_PREFIX = 'chunks:';

export class DynamoDBCache implements KeyValueCache<string>, IManyKeyValueCache<string> {
    private client: AWS.DynamoDB.DocumentClient;

    constructor(
        serviceConfigOptions: AWS.DynamoDB.Types.ClientConfiguration,
        private tableOptions: {
            tableName: AWS.DynamoDB.TableName,
            ttl?: number,
        },
        private version?: string,
        private logger: ILogger = console,
    ) {
        this.client = new DocumentClient(serviceConfigOptions);
    }

    public async set(
        id: string,
        data: string,
        options?: ICacheOptions,
    ) {
        this.logger.log('set', id, options);
        await this.setMany([{
            id,
            data,
            options,
        }]);
    }

    public async setMany(data: CacheData<string>[]) {
        this.logger.log('setMany', data.map((d) => d.id));

        const mapped: [string, WriteRequest][][] = data.map((rawData) => {
            const chunks = this.chunkSubstr(rawData.data, 350 * 1024);
            if (chunks.length > 1) {
                const chunkItems: [string, WriteRequest][] = chunks.map((chunk, i) => ([
                    this.tableOptions.tableName,
                    {
                        PutRequest: {
                            Item: this.addTTLAndVersion({
                                id: `${rawData.id}_${i}`,
                                options: rawData.options,
                                data: chunk,
                            }),
                        },
                    } as WriteRequest,
                ]));

                return [
                    [
                        this.tableOptions.tableName,
                        {
                            PutRequest: {
                                Item: this.addTTLAndVersion({
                                    id: rawData.id,
                                    options: rawData.options,
                                    data: `${CHUNKS_PREFIX}${chunks.length}`,
                                }),
                            },
                        } as WriteRequest,
                    ],
                    ...chunkItems,
                ];
            }

            // array with one element
            return [[
                this.tableOptions.tableName,
                {
                    PutRequest: {
                        Item: this.addTTLAndVersion(
                            {
                                id: rawData.id,
                                data: rawData.data,
                            },
                            rawData.options,
                        ),
                    },
                } as WriteRequest,
            ]];
        });

        for await (const item of new BatchWrite(this.client, mapped.flat())) {
            this.logger.log('Updated', item[0], item[1].PutRequest?.Item.id);
        }
    }

    // chunks are cleandup automatically, we ignore that here
    public async delete(id: string): Promise<boolean | void> {
        this.logger.log('delete', id);

        await this.client.delete({
            TableName: this.tableOptions.tableName,
            Key: { id },

        }).promise();
    }

    public async getMany(ids: string[]): Promise<CacheValues<string>> {
        this.logger.log('getMany', ids);

        const items: [string, AWS.DynamoDB.DocumentClient.AttributeMap][] = ids.map((id) => ([
            this.tableOptions.tableName,
            { id },
        ]));

        const getRequest = new BatchGet(
            this.client,
            items,
            {
                ConsistentRead: false,
            },
        );

        const result: CacheValues<string> = {};
        for await (const item of getRequest) {
            const [table, cachedItem] = item as [string, VersionedCacheData<string>];
            this.logger.log('Received', table, cachedItem.id);

            // chedk if it's valid
            if (this.checkTTLAndVersion(cachedItem as any)) {
                if ((cachedItem.data as string).startsWith(CHUNKS_PREFIX)) {
                    const count = parseInt(cachedItem.data.substr(CHUNKS_PREFIX.length), 10);
                    this.logger.log('found chunk', cachedItem.id, cachedItem.data, count);

                    // recursion
                    const chunkedResult = await this.getMany(
                        // @ts-ignore
                        // tslint:disable-next-line: variable-name
                        Array.apply(null, { length: count }).map((_v, i) => `${cachedItem.id}_${i}`),
                    );

                    let finalResult = '';
                    // tslint:disable-next-line: no-increment-decrement
                    for (let i = 0; i < count; ++i) {
                        finalResult += chunkedResult[`${cachedItem.id}_${i}`];
                    }

                    if (finalResult !== '') {
                        result[cachedItem.id] = finalResult as string;
                    }
                } else {
                    result[cachedItem.id] = cachedItem.data;
                }
            }
        }

        return result;
    }

    public async get(id: string): Promise<string | undefined> {
        this.logger.log('get', id);

        const reply = await this.getMany([id]);
        return reply[id] || undefined;
    }

    private addTTLAndVersion(item: CacheData<string>, options?: ICacheOptions): VersionedCacheData<string> {
        const result: VersionedCacheData<string> = { ...item };
        const ttl = options && options.ttl != null
            ? options.ttl
            : (this.tableOptions.ttl || 0);

        if (ttl !== 0) {
            this.logger.log(
                'item', item.id, 'valid for',
                Math.round(ttl / 60 / 60 * 100) / 100,
                'h', 'version', this.version);

            result.ttl = Math.floor(Date.now() / 1000) + ttl;
        }

        if (this.version != null) {
            result.version = this.version;
        }

        return result;
    }

    private checkTTLAndVersion({ ttl, id, version }: VersionedCacheData<string>): boolean {
        if (this.version != null && this.version !== version) {
            this.logger.log('item', id, 'version different', 'Old:', version, 'New:', this.version);
            return false;
        }

        // never expires
        if (ttl === 0 || ttl == null) {
            this.logger.log('item', id, 'never expires.');
            return true;
        }

        if (ttl < Math.floor(Date.now() / 1000)) {
            this.logger.log('item', id, 'was expired.');
            return false;
        }

        this.logger.log(
            'item', id, 'valid for',
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
