import { WebsocketEventBase } from './WebsocketEvent';

export type EncodedWebsocketEvent = {
    pushNotification?: string;
    payload: string;
} & WebsocketEventBase;
