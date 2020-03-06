import { WebsocketEventBase } from './WebsocketEvent';
import { EncryptedValue } from './EncryptedValue';

export type EncodedWebsocketEvent = {
    pushNotification?: EncryptedValue | any;
    payload: EncryptedValue | any;

    trackDelivery: boolean,
} & WebsocketEventBase;
