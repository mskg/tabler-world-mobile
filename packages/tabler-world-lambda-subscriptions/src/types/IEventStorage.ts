import { AnyWebsocketEvent, WebsocketEvent } from './WebsocketEvent';

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
    get<T, PN>(id: string): Promise<WebsocketEvent<T, PN> | undefined>;
    list<T, PN>(trigger: string, options: QueryOptions): Promise<PaggedResponse<WebsocketEvent<T, PN>>>;
    remove(trigger: string, ids: string[]): Promise<void>;
    post(event: AnyWebsocketEvent[]): Promise<void>;
    markDelivered(trigger: string, id: string): Promise<void>;
}
