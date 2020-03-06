import { WebsocketEvent } from '@mskg/tabler-world-graphql-subscriptions';

export type WebsocketMessagePayLoad = Record<string, any> & { plain?: boolean };

export type WebsocketMessage<T extends WebsocketMessagePayLoad> = Pick<
    WebsocketEvent<T>,
    | 'sender'
    | 'payload'
    | 'pushNotification'
    | 'volatile'
    | 'trackDelivery'
> & {
    triggers: string[],
    ttl: number,
};
