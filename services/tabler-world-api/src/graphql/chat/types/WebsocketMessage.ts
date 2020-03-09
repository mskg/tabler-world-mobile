import { WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';

export type WebsocketMessage<T extends EncrytablePayload> = Pick<
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

export type EncrytablePayload = Record<string, any> & {
    /***
     * True, if message is not encrpyted
     */
    plain?: boolean,
};
