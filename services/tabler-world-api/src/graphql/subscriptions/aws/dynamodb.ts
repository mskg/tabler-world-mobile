import { DocumentClient, EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';

export const dynamodb = new DocumentClient({
    region: process.env.AWS_REGION,

    endpoint:
        EXECUTING_OFFLINE
            ? 'http://localhost:8004'
            : undefined,
});
