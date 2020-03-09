import { WebsocketEvent } from '@mskg/tabler-world-lambda-subscriptions';
import { PushNotification } from '@mskg/tabler-world-push-client';

/**
 * Attributes which are related to sending are omitted here
 */
export type PartialPushNotification = Pick<PushNotification<any>,
    | 'options'
    | 'body'
    | 'title'
    | 'reason'
    | 'subtitle'
>;

export type WebsocketMessage<T extends EncrytablePayload> = Pick<
    WebsocketEvent<T, PartialPushNotification | undefined>,
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
