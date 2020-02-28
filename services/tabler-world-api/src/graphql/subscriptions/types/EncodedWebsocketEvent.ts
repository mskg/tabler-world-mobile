import { EncodedValue } from '../services/EncryptionManager';
import { WebsocketEventBase } from './WebsocketEvent';

export type EncodedWebsocketEvent = {
    pushNotification?: EncodedValue | any;
    payload: EncodedValue | any;

    trackDelivery: boolean,
} & WebsocketEventBase;
