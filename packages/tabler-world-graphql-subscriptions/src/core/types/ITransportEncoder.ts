import { WebsocketEvent } from './WebsocketEvent';

export interface ITransportEncoder<TFrom, TTo> {
    encode(event: WebsocketEvent<TFrom>): Promise<WebsocketEvent<TTo>>;
    decode(event: WebsocketEvent<TTo>): Promise<WebsocketEvent<TFrom>>;
}
