import { KeyValueCache } from 'apollo-server-core';
import DynamoDB, { DocumentClient, TableName } from 'aws-sdk/clients/dynamodb';

export class DynamoDBCache implements KeyValueCache<string> {
    client: DocumentClient;

    constructor(
        serviceConfigOptions: DynamoDB.Types.ClientConfiguration,
        private tableOptions: {
            tableName: TableName,
            ttl: number,
        },
    ) {
        this.client = new DynamoDB.DocumentClient(serviceConfigOptions);
    }

    public async set(
        id: string,
        data: string,
        options?: { ttl?: number },
    ) {
        console.log("[Cache] set", id, options);

        const params = {
            ...this.tableOptions,
            ...options || {},
        }

        let item =
            params.ttl !== 0
                ? {
                    id,
                    data,
                    ttl: params.ttl,
                }
                : {
                    id,
                    data,
                };

        await this.client
            .put({
                TableName: params.tableName,
                Item: item,
            })
            .promise();
    }

    public async delete(id: string): Promise<boolean | void> {
        console.log("[Cache] delete", id);

        await this.client.delete({
            TableName: this.tableOptions.tableName,
            Key: { S: id.toString() },
        });
    }

    public async get(id: string): Promise<string | undefined> {
        console.log("[Cache] get", id);

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

        // reply is null if key is not found
        if (
            reply &&
            reply.Items &&
            reply.Items[0] &&
            reply.Items[0].data &&
            reply.Items[0].data.S
        ) {
            return reply.Items[0].data.S;
        }

        return;
    }
}