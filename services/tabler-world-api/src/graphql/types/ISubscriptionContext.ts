import { IApolloContext } from './IApolloContext';

export interface ISubscriptionContext extends IApolloContext {
    connectionId: string;
}
