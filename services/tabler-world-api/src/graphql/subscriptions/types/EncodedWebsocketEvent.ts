import { EncodedValue } from '../services/EncryptionManager';
import { WebsocketEventBase } from './WebsocketEvent';

export type EncodedWebsocketEvent = {
    pushNotification?: EncodedValue;
    payload: EncodedValue;

    trackDelivery: boolean,
} & WebsocketEventBase;
