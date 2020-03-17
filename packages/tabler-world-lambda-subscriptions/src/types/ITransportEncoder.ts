import { WebsocketEvent } from './WebsocketEvent';

export interface ITransportEncoder<
    TFrom, TFromPush,
    TTo, TToPush,
    > {
    encode(event: WebsocketEvent<TFrom, TFromPush>): Promise<WebsocketEvent<TTo, TToPush>>;
    decode(event: WebsocketEvent<TTo, TToPush>): Promise<WebsocketEvent<TFrom, TFromPush>>;
}
