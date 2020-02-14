import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// tslint:disable: interface-name

/**
 * A synchronous or asynchronous iterable.
 */
export type SyncOrAsyncIterable<T> = Iterable<T> | AsyncIterable<T>;

/**
 * @internal
 */
export interface BatchState<Element extends TableStateElement> {
    [tableName: string]: TableState<Element>;
}

/**
 * @internal
 */
export interface TableState<Element extends TableStateElement> {
    attributeNames?: DocumentClient.ExpressionAttributeNameMap;
    backoffFactor: number;
    consistentRead?: DocumentClient.ConsistentRead;
    name: string;
    projection?: DocumentClient.ProjectionExpression;
    tableThrottling?: TableThrottlingTracker<Element>;
}

/**
 * @internal
 */
export type TableStateElement = DocumentClient.AttributeMap | DocumentClient.WriteRequest;

/**
 * @internal
 */
export interface TableThrottlingTracker<Element extends TableStateElement> {
    backoffWaiter: Promise<ThrottledTableConfiguration<Element>>;
    unprocessed: Element[];
}

/**
 * @internal
 */
export interface ThrottledTableConfiguration<
    Element extends TableStateElement
    > extends TableState<Element> {
    tableThrottling: TableThrottlingTracker<Element>;
}

/**
 * A write request for which exactly one of the `PutRequest` and `DeleteRequest`
 * properties has been defined.
 */
export type WriteRequest =
    DocumentClient.WriteRequest & { PutRequest: DocumentClient.PutRequest, DeleteRequest?: undefined } |
    DocumentClient.WriteRequest & { DeleteRequest: DocumentClient.DeleteRequest, PutRequest?: undefined };

