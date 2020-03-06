export type PushSubscriber = {
    id: number,
    muted: boolean;
};

export interface IPushSubscriptionManager {
    // must filter for chat enabled
    getSubscribers(conversation: string): Promise<PushSubscriber[]>;
}
