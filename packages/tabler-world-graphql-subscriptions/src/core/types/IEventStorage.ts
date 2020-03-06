import { PushNotificationBase } from '@mskg/tabler-world-push-client';
import { EncodedWebsocketEvent } from './EncodedWebsocketEvent';

export type QueryOptions = {
    forward?: boolean,
    pageSize: number,
    token?: any,
};

export type PaggedResponse<T> = {
    result: T[]
    nextKey?: any,
};

export type WebsocketMessage<T> = {
    sender?: number,
    triggers: string[],
    payload: T,

    pushNotification?: {
        sender?: number,
        message: PushNotificationBase<T>,
    },

    encrypted: boolean,
    volatile?: boolean,
    trackDelivery?: boolean,

    ttl?: number,
};

export interface IEventStorage {
    get(id: string): Promise<EncodedWebsocketEvent | undefined>;
    list(trigger: string, options: QueryOptions): Promise<PaggedResponse<EncodedWebsocketEvent>>;
    remove(trigger: string, ids: string[]): Promise<void>;
    post(event: EncodedWebsocketEvent[]): Promise<void>;
    markDelivered(trigger: string, id: string): Promise<void>;
}
