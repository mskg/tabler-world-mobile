import { ISubscription } from './ISubscription';

export type SubscriptionDetails = ISubscription<any>;

export interface ISubscriptionStorage {
    list(trigger: string): Promise<ISubscription<any>[]>;
    hasSubscribers(triggers: string[]): Promise<string[]>;

    put(triggers: string[], detail: SubscriptionDetails, ttl: number): Promise<void>;
    remove(connectionId: string, subscriptionId?: string): Promise<void>;
}
