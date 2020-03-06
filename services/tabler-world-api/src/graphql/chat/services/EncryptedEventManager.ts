import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IEventStorage, ITransportEncoder, PaggedResponse, QueryOptions, WebsocketEvent } from '@mskg/tabler-world-graphql-subscriptions';
import { ulid } from 'ulid';
import { WebsocketMessage, WebsocketMessagePayLoad } from '../types/WebsocketMessage';

const logger = new ConsoleLogger('ws:event');
const EMPTY_RESULT = { result: [] };

export class EncryptedEventManager {
    constructor(
        private storage: IEventStorage,
        private encryption: ITransportEncoder<any, any>,
    ) { }

    public async events<T>(trigger: string, options: QueryOptions = { forward: false, pageSize: 10 }): Promise<PaggedResponse<WebsocketEvent<T>>> {
        logger.debug('event', trigger);
        const result = await this.storage.list<T>(trigger, options);

        // @ts-ignore
        return result
            ? {
                nextKey: result.nextKey,
                result: await Promise.all(
                    result.result.map((m) => this.encryption.decode(m)),
                ),
            }
            : EMPTY_RESULT;
    }

    public async post<T extends WebsocketMessagePayLoad>({
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

        const messages = await Promise.all(triggers.map(async (t) => {
            const sendPayload = {
                // need a full copy
                ...JSON.parse(JSON.stringify(baseMessage)),
                id: ulid(),
                eventName: t,
            } as WebsocketEvent<T>;

            const transportMessage = await this.encryption.encode(sendPayload);

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
}
