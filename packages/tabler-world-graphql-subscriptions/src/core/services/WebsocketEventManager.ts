import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ulid } from 'ulid';
import { EncodedWebsocketEvent } from '../types/EncodedWebsocketEvent';
import { IEncryptionManager, IEncryptionWorker } from '../types/IEncryptionManager';
import { IEventStorage, PaggedResponse, QueryOptions, WebsocketMessage } from '../types/IEventStorage';
import { WebsocketEvent } from '../types/WebsocketEvent';

const logger = new ConsoleLogger('ws:event');
const EMPTY_RESULT = { result: [] };

export class WebsocketEventManager {
    constructor(
        private storage: IEventStorage,
        private encryption: IEncryptionManager,
    ) { }

    public async unMarshall<T>(message: EncodedWebsocketEvent): Promise<WebsocketEvent<T>> {
        if (message.plain) {
            return this.unMarshallUnecrypted(message);
        }

        const em = await this.encryption.createWorker(message.eventName);
        return this.unMarshallWithEncryptionManager<T>(em, message);
    }

    public async getEvent<T>(id: string): Promise<WebsocketEvent<T> | undefined> {
        const item = await this.storage.get(id);

        if (!item) { return undefined; }
        if (item.plain) { return this.unMarshallUnecrypted(item as EncodedWebsocketEvent); }

        const em = await this.encryption.createWorker(item.eventName);
        return this.unMarshallWithEncryptionManager(em, item as EncodedWebsocketEvent);
    }

    public async events<T = any>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.debug('event', trigger);

        const em = await this.encryption.createWorker(trigger);
        const result = await this.storage.list(trigger, options);

        // @ts-ignore
        return result
            ? {
                nextKey: result.nextKey,
                result: await Promise.all(
                    result.result.map((m) => {
                        if (m.plain) { return this.unMarshallUnecrypted(m as EncodedWebsocketEvent); }
                        return this.unMarshallWithEncryptionManager(em, m as EncodedWebsocketEvent);
                    }),
                ),
            }
            : EMPTY_RESULT;
    }

    public async markDelivered({ eventName, id }: WebsocketEvent<any>) {
        logger.debug('markDelivered', id);
        await this.storage.markDelivered(eventName, id);
    }

    public async post<T = any>(
        { triggers, payload, pushNotification, ttl, sender, trackDelivery = true, encrypted, volatile = false }: WebsocketMessage<T>,
    ): Promise<WebsocketEvent<T>[]> {
        logger.log('postMessage', triggers, payload);

        const baseMessage = {
            trackDelivery,
            payload,
            volatile,
            sender,
            timestamp: Date.now(),

            // we have to invert the condition to be compatible
            // with old messages
            plain: !encrypted,

            pushNotification: pushNotification ? pushNotification.message : undefined,
            delivered: false,
        } as WebsocketEvent<T>;

        const messages = await Promise.all(triggers.map(async (t) => {
            const sendPayload = {
                // need a full copy
                ...JSON.parse(JSON.stringify(baseMessage)),
                id: ulid(),
                eventName: t,
            };

            let transportMessage;
            if (encrypted) {
                const em = await this.encryption.createWorker(t);
                transportMessage = await this.marshallEncrypted<T>(em, sendPayload);
            } else {
                transportMessage = this.marshallUnencrypted<T>(sendPayload);
            }

            // we don't care about the little drift
            if (ttl) {
                // @ts-ignore
                transportMessage.ttl = Math.floor(Date.now() / 1000) + ttl;
            }

            return transportMessage;
        }));

        await this.storage.post(messages);

        return messages.map((m) => ({
            ...baseMessage,
            id: m.id,
            eventName: m.eventName,
        }));
    }

    public async remove(eventName: string, ids: string[]): Promise<void> {
        logger.log('remove', ids);
        await this.storage.remove(eventName, ids);
    }

    private async marshallEncrypted<T>(em: IEncryptionWorker, message: WebsocketEvent<T>): Promise<EncodedWebsocketEvent> {
        return {
            id: message.id,
            eventName: message.eventName,

            sender: message.sender,

            payload: await em.encrypt(message.payload),
            pushNotification: message.pushNotification
                ? await em.encrypt(message.pushNotification)
                : undefined,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            volatile: message.volatile,
            plain: message.plain,

            timestamp: message.timestamp,
        };
    }

    private marshallUnencrypted<T>(message: WebsocketEvent<T>): EncodedWebsocketEvent {
        return {
            id: message.id,
            eventName: message.eventName,

            sender: message.sender,

            payload: message.payload,
            pushNotification: message.pushNotification,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            volatile: message.volatile,
            plain: message.plain,

            timestamp: message.timestamp,
        };
    }

    private unMarshallUnecrypted<T>(message: EncodedWebsocketEvent): WebsocketEvent<T> {
        return {
            id: message.id,
            eventName: message.eventName,
            sender: message.sender,

            payload: message.payload,
            pushNotification: message.pushNotification,

            plain: message.plain,
            volatile: message.volatile,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            timestamp: message.timestamp,
        };
    }

    private async unMarshallWithEncryptionManager<T>(em: IEncryptionWorker, message: EncodedWebsocketEvent): Promise<WebsocketEvent<T>> {
        return {
            id: message.id,
            eventName: message.eventName,
            sender: message.sender,

            payload: await em.decrypt<T>(message.payload),
            pushNotification: message.pushNotification
                ? await em.decrypt(message.pushNotification)
                : undefined,

            delivered: message.delivered,
            trackDelivery: message.trackDelivery,

            plain: message.plain,
            volatile: message.volatile,

            timestamp: message.timestamp,
        };
    }
}
