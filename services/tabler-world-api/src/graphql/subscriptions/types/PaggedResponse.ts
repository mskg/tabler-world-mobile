import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export type PaggedResponse<T> = {
    result: T[];
    nextKey?: DocumentClient.Key;
};
