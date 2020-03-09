import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IEventStorage, PaggedResponse, QueryOptions, WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { ulid } from 'ulid';
import { EncrytablePayload, WebsocketMessage } from '../types/WebsocketMessage';
import { PushNotification } from '@mskg/tabler-world-push-client';

const logger = new ConsoleLogger('chat:event');

type EventType<T extends EncrytablePayload> = WebsocketEvent<T, PushNotification<any> | undefined>;

export class EventManager {
    constructor(
        private storage: IEventStorage,
    ) { }

    public events<T, PN = null>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T, PN>>> {
        logger.debug('event', trigger);
        return this.storage.list<T, PN>(trigger, options);
    }

    public async post<T extends EncrytablePayload>({
        triggers,
        payload,
        pushNotification,
        ttl,
        sender,
        trackDelivery = true,
        volatile = false,
    }: WebsocketMessage<T>): Promise<WebsocketEvent<T>[]> {
        logger.log('postMessage', triggers, payload);

        const baseMessage = {
            trackDelivery,
            payload,
            volatile,
            sender,
            pushNotification,
            timestamp: Date.now(),
            delivered: false,
        };

        const messages: EventType<T>[] = triggers.map((t) => {
            const sendPayload = {
                // need a full copy
                ...JSON.parse(JSON.stringify(baseMessage)),
                id: ulid(),
                eventName: t,
            } as EventType<T>;

            // we don't care about the little drift
            if (ttl) {
                // @ts-ignore
                sendPayload.ttl = Math.floor(Date.now() / 1000) + ttl;
            }

            return sendPayload;
        });

        await this.storage.post(messages);

        return messages.map((m) => ({
            ...baseMessage,
            id: m.id,
            eventName: m.eventName,
            pushNotification: undefined, // not required
        }));
    }
}
