import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export type QueryOptions = {
    pageSize: number;
    token?: DocumentClient.Key;
};
