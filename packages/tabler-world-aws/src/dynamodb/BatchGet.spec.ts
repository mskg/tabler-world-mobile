import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { BatchGet, MAX_READ_BATCH_SIZE } from './BatchGet';

// tslint:disable: mocha-no-side-effect-code
// tslint:disable: max-func-body-length
// tslint:disable: prefer-array-literal
// tslint:disable: no-string-based-set-timeout
// tslint:disable: insecure-random

describe('BatchGet', () => {
    const promiseFunc = jest.fn(() => Promise.resolve({
        UnprocessedKeys: {},
    } as DocumentClient.BatchGetItemOutput));

    const mockDynamoDbClient = {
        config: {},
        batchGet: jest.fn(() => ({ promise: promiseFunc })),
    } as any;

    beforeEach(() => {
        promiseFunc.mockClear();
        mockDynamoDbClient.batchGet.mockClear();
    });

    it('should return itself when its Symbol.asyncIterator method is called', () => {
        const batchGet = new BatchGet({} as any, []);
        expect(batchGet[Symbol.asyncIterator]()).toBe(batchGet);
    });

    it('should allow setting an overall read consistency', async () => {
        const batchGet = new BatchGet(
            mockDynamoDbClient as any,
            [['foo', { fizz: 0 }]],
            { ConsistentRead: true },
        );
        for await (const _ of batchGet) {
            console.log(_ === undefined);
            // pass
        }

        expect(mockDynamoDbClient.batchGet.mock.calls).toEqual([
            [
                {
                    RequestItems: {
                        foo: {
                            Keys: [
                                { fizz: 0 },
                            ],
                            ConsistentRead: true,
                        },
                    },
                },
            ],
        ]);
    });

    it('should allow setting per-table read consistency', async () => {
        const batchGet = new BatchGet(
            mockDynamoDbClient as any,
            [
                ['foo', { fizz: 0 }],
                ['bar', { quux: 1 }],
            ],
            {
                ConsistentRead: true,
                PerTableOptions: {
                    bar: { ConsistentRead: false },
                },
            },
        );

        for await (const _ of batchGet) {
            // pass
        }

        expect(mockDynamoDbClient.batchGet.mock.calls).toEqual([
            [
                {
                    RequestItems: {
                        foo: {
                            Keys: [
                                { fizz: 0 },
                            ],
                            ConsistentRead: true,
                        },
                        bar: {
                            Keys: [
                                { quux: 1 },
                            ],
                            ConsistentRead: false,
                        },
                    },
                },
            ],
        ]);
    });

    it('should allow specifying per-table projection expressions', async () => {
        const batchGet = new BatchGet(
            mockDynamoDbClient as any,
            [
                ['foo', { fizz: 0 }],
                ['bar', { quux: 1 }],
            ],
            {
                PerTableOptions: {
                    bar: {
                        ProjectionExpression: 'snap[1].crackle.pop[2]',
                    },
                },
            },
        );

        for await (const _ of batchGet) {
            // pass
        }

        expect(mockDynamoDbClient.batchGet.mock.calls).toEqual([
            [
                {
                    RequestItems: {
                        foo: {
                            Keys: [
                                { fizz: 0 },
                            ],
                        },
                        bar: {
                            Keys: [
                                { quux: 1 },
                            ],
                            ProjectionExpression: 'snap[1].crackle.pop[2]',
                        },
                    },
                },
            ],
        ]);
    });

    for (const asyncInput of [true, false]) {
        it(
            `should should partition get batches into requests with ${MAX_READ_BATCH_SIZE} or fewer items`,
            async () => {
                const gets: Array<[string, DocumentClient.AttributeMap]> = [];
                const expected: any = [
                    [
                        {
                            RequestItems: {
                                snap: { Keys: [] },
                                crackle: { Keys: [] },
                                pop: { Keys: [] },
                            },
                        },
                    ],
                    [
                        {
                            RequestItems: {
                                snap: { Keys: [] },
                                crackle: { Keys: [] },
                                pop: { Keys: [] },
                            },
                        },
                    ],
                    [
                        {
                            RequestItems: {
                                snap: { Keys: [] },
                                crackle: { Keys: [] },
                                pop: { Keys: [] },
                            },
                        },
                    ],
                    [
                        {
                            RequestItems: {
                                snap: { Keys: [] },
                                crackle: { Keys: [] },
                                pop: { Keys: [] },
                            },
                        },
                    ],
                ];
                const responses: any = [
                    {
                        Responses: {
                            snap: [],
                            crackle: [],
                            pop: [],
                        },
                    },
                    {
                        Responses: {
                            snap: [],
                            crackle: [],
                            pop: [],
                        },
                    },
                    {
                        Responses: {
                            snap: [],
                            crackle: [],
                            pop: [],
                        },
                    },
                    {
                        Responses: {
                            snap: [],
                            crackle: [],
                            pop: [],
                        },
                    },
                ];

                for (let i = 0; i < 325; i++) {
                    const table = i % 3 === 0
                        ? 'snap'
                        : i % 3 === 1 ? 'crackle' : 'pop';
                    const fizz = String(i);
                    const buzz = 'Static string';
                    gets.push([table, { fizz: String(i) }]);

                    responses[Math.floor(i / MAX_READ_BATCH_SIZE)]
                        .Responses[table]
                        .push({ fizz, buzz });

                    expected[Math.floor(i / MAX_READ_BATCH_SIZE)][0]
                        .RequestItems[table].Keys
                        .push({ fizz });
                }

                for (const response of responses) {
                    promiseFunc.mockImplementationOnce(
                        () => Promise.resolve(response),
                    );
                }

                const input = asyncInput
                    ? async function* () {
                        for (const item of gets) {
                            // tslint:disable-next-line: no-string-based-set-timeout
                            await new Promise((resolve) => setTimeout(
                                resolve,
                                // tslint:disable-next-line: insecure-random
                                Math.round(Math.random()),
                            ));
                            yield item;
                        }
                    }()
                    : gets;

                const seen = new Set<number>();
                for await (const [table, item] of new BatchGet(mockDynamoDbClient as any, input)) {
                    const id = parseInt(item.fizz as string, 10);
                    expect(seen.has(id)).toBe(false);
                    seen.add(id);

                    if (id % 3 === 0) {
                        expect(table).toBe('snap');
                    } else if (id % 3 === 1) {
                        expect(table).toBe('crackle');
                    } else {
                        expect(table).toBe('pop');
                    }

                    expect(item.buzz).toEqual('Static string');
                }

                expect(seen.size).toBe(gets.length);

                const { calls } = mockDynamoDbClient.batchGet.mock;
                expect(calls.length)
                    .toBe(Math.ceil(gets.length / MAX_READ_BATCH_SIZE));
                expect(calls).toEqual(expected);
            },
        );

        it('should should retry unprocessed items', async () => {
            const failures = new Set(['24', '66', '99', '103', '142', '178', '204', '260', '288']);
            const gets: Array<[string, DocumentClient.AttributeMap]> = [];

            // tslint:disable-next-line: no-increment-decrement
            for (let i = 0; i < 325; i++) {
                const table = i % 3 === 0
                    ? 'snap'
                    : i % 3 === 1 ? 'crackle' : 'pop';
                gets.push([table, { fizz: String(i) }]);
            }

            const toBeFailed = new Set(failures);
            promiseFunc.mockImplementation(() => {
                const buzz = 'Static string';
                const response: DocumentClient.BatchGetItemOutput = {};

                const { RequestItems } = (mockDynamoDbClient.batchGet.mock.calls.slice(-1)[0] as any)[0];
                for (const tableName of Object.keys(RequestItems)) {
                    for (const item of RequestItems[tableName].Keys) {
                        if (toBeFailed.has(item.fizz)) {
                            if (!response.UnprocessedKeys) {
                                response.UnprocessedKeys = {};
                            }

                            if (!(tableName in response.UnprocessedKeys)) {
                                response.UnprocessedKeys[tableName] = { Keys: [] };
                            }

                            response.UnprocessedKeys[tableName].Keys.push(item);
                            toBeFailed.delete(item.fizz);
                        } else {
                            if (!response.Responses) {
                                response.Responses = {};
                            }

                            if (!(tableName in response.Responses)) {
                                response.Responses[tableName] = [];
                            }

                            response.Responses[tableName].push({
                                ...item,
                                buzz,
                            });
                        }
                    }
                }

                return Promise.resolve(response);
            });

            const input = asyncInput
                ? async function* () {
                    for (const item of gets) {
                        await new Promise((resolve) => setTimeout(
                            resolve,
                            Math.round(Math.random()),
                        ));
                        yield item;
                    }
                }()
                : gets;

            const idsReturned = new Set<number>();
            for await (const [table, item] of new BatchGet(mockDynamoDbClient as any, input)) {
                const id = parseInt(item.fizz as string, 10);
                expect(idsReturned.has(id)).toBe(false);
                idsReturned.add(id);

                if (id % 3 === 0) {
                    expect(table).toBe('snap');
                } else if (id % 3 === 1) {
                    expect(table).toBe('crackle');
                } else {
                    expect(table).toBe('pop');
                }

                expect(item.buzz).toEqual('Static string');
            }

            expect(idsReturned.size).toBe(gets.length);
            expect(toBeFailed.size).toBe(0);

            const { calls } = mockDynamoDbClient.batchGet.mock;
            expect(calls.length).toBe(Math.ceil(gets.length / MAX_READ_BATCH_SIZE));

            const callCount: { [key: string]: number } = (calls as Array<Array<DocumentClient.BatchGetItemInput>>).reduce(
                (
                    keyUseCount: { [key: string]: number },
                    [{ RequestItems }],
                ) => {
                    const keys = [];
                    for (const table of Object.keys(RequestItems)) {
                        keys.push(...RequestItems[table].Keys);
                    }
                    for (const { fizz: key } of keys) {
                        if (key) {
                            if (key in keyUseCount) {
                                // tslint:disable-next-line: no-increment-decrement
                                keyUseCount[key]++;
                            } else {
                                keyUseCount[key] = 1;
                            }
                        }
                    }

                    return keyUseCount;
                },
                {},
            );

            for (let i = 0; i < gets.length; i++) {
                expect(callCount[i]).toBe(failures.has(String(i)) ? 2 : 1);
            }
        });
    }
});
