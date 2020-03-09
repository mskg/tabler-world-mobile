import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ITransportEncoder, WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { getChatParams } from '../helper/getChatParams';
import { EncryptedValue } from '../types/EncryptedValue';
import { TweetNaClEnryptionManager } from './TweetNaClEnryptionManager';

const nacl = new TweetNaClEnryptionManager(async () => {
    const p = await getChatParams();
    return p.masterKey;
});

type EncryptedPayload = {
    version?: string,
    payload: any,
    pushNotification?: any,
};

const logger = new ConsoleLogger('nacl');

export class NaClEncryptionEncoder implements ITransportEncoder<any, any, any | EncryptedValue, any> {
    public async encode(event: WebsocketEvent<any>): Promise<WebsocketEvent<any | EncryptedValue>> {
        logger.debug('encode', event.id, event.payload?.plain);
        if (event.payload?.plain) { return event; }

        const em = await nacl.createWorker(event.eventName);
        return {
            ...event,

            // clear it out
            pushNotification: undefined,

            // both values are sensitive
            payload: await em.encrypt({
                version: 'v2',
                payload: event.payload,
                pushNotification: event.pushNotification,
            }),
        };
    }

    public async decode(event: WebsocketEvent<any | EncryptedValue>): Promise<WebsocketEvent<any>> {
        if (!event.payload?.nonce || !event.payload?.ciphertext) {
            logger.debug('decode', event.id, 'is plain');
            return event;
        }

        logger.debug('decode', event.id);
        const em = await nacl.createWorker(event.eventName);

        const newPayload = await em.decrypt<EncryptedPayload>(event.payload);
        if (newPayload.version === 'v2') {
            return {
                ...event,
                payload: newPayload.payload,
                pushNotification: newPayload.pushNotification,
            };
        }

        logger.debug('decode', event.id, 'is old version');

        return {
            ...event,
            payload: newPayload,

            // be compatible with old messages
            pushNotification: event.pushNotification
                ? await em.decrypt(event.pushNotification as unknown as EncryptedValue)
                : undefined,
        };
    }
}
