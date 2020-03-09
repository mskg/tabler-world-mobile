import { IConnection } from './IConnection';

export type ConnectionDetails =
    // only available after authentication
    Partial<IConnection<any>> &

    // must always be there
    Pick<IConnection<any>, 'connectionId'>;

export interface IConnectionStorage {
    get(connectionId: string): Promise<IConnection<any> | undefined>;
    put(data: ConnectionDetails, ttl: number): Promise<void>;
    remove(connectionId: string): Promise<void>;
}
