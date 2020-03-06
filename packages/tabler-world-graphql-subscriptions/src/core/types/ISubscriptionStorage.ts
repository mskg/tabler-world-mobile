import { IConnection } from '../types/IConnection';
import { ISubscription } from '../types/ISubscription';

export type SubscriptionDetails = {
    connection: IConnection,
    subscriptionId: string,
    payload: any,
};

export interface ISubscriptionStorage {
    list(trigger: string): Promise<ISubscription<any>[]>;
    hasSubscribers(triggers: string[]): Promise<string[]>;

    put(triggers: string[], detail: SubscriptionDetails, ttl: number): Promise<void>;
    remove(connectionId: string, subscriptionId?: string): Promise<void>;
}
