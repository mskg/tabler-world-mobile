import { AnyWebsocketEvent } from './WebsocketEvent';

export type PushSubscriber = {
    id: number,
    muted: boolean;
};

export interface IPushSubscriptionManager {
    send(event: AnyWebsocketEvent, members: PushSubscriber[]): Promise<void>;

    // must filter for chat enabled
    getSubscribers(conversation: string): Promise<PushSubscriber[]>;
}
