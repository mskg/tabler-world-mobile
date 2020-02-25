import { OperationMessagePayload } from 'subscriptions-transport-ws';
import { IConnection } from './IConnection';

export interface ISubscription {
    connection: IConnection;

    subscriptionId: string;
    payload?: OperationMessagePayload;
}
