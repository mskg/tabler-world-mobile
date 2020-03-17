import { DocumentClient as Client, EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

let instance: DocumentClient;

export function createDynamoDBInstance() {
    if (!instance) {
        instance = new Client({
            region: process.env.AWS_REGION,

            endpoint:
                EXECUTING_OFFLINE
                    ? 'http://localhost:8004'
                    : undefined,
        });
    }

    return instance;
}
