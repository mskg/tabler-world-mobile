import { OperationMessagePayload } from 'subscriptions-transport-ws';
import { IConnection } from './IConnection';

export interface ISubscription<Context> {
    connection: IConnection<Context>;
    subscriptionId: string;
    payload?: OperationMessagePayload;
}
