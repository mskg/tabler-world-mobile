import { WebsocketEvent } from './WebsocketEvent';

export type QueryOptions = {
    forward?: boolean,
    pageSize: number,
    token?: any,
};

export type PaggedResponse<T> = {
    result: T[]
    nextKey?: any,
};

export interface IEventStorage {
    get<T>(id: string): Promise<WebsocketEvent<T> | undefined>;
    list<T>(trigger: string, options: QueryOptions): Promise<PaggedResponse<WebsocketEvent<T>>>;
    remove(trigger: string, ids: string[]): Promise<void>;
    post<T>(event: WebsocketEvent<T>[]): Promise<void>;
    markDelivered(trigger: string, id: string): Promise<void>;
}
