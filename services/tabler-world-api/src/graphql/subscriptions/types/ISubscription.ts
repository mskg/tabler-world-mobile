import { IConnection } from './IConnection';

export interface ISubscription {
    connection: IConnection;
    subscriptionId: string;
}
