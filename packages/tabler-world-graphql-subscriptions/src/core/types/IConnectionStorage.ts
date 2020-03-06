import { IConnection } from '../types/IConnection';

export type ConnectionDetails = Partial<IConnection> & Pick<IConnection, 'connectionId'>;

export interface IConnectionStorage {
    get(connectionId: string): Promise<IConnection<any> | undefined>;
    put(data: ConnectionDetails, ttl: number): Promise<void>;
    remove(connectionId: string): Promise<void>;
}
