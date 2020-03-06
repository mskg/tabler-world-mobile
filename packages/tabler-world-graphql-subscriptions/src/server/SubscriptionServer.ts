import { createPublishMessageLambda } from '../lambda/createPublishMessageLambda';
import { createWebsocketLambda } from '../lambda/createWebsocketLambda';
import { Config } from './Config';
import { SubscriptionServerContext } from './SubscriptionServerContext';

export class SubscriptionServer<TConnectionContext = any, TResolverContext = any> {
    context: SubscriptionServerContext<TConnectionContext, TResolverContext>;

    constructor(public readonly config: Config<TConnectionContext, TResolverContext>) {
        this.context = new SubscriptionServerContext(config);
    }

    get subscriptionManager() {
        return this.context.subscriptionManager;
    }

    createWebsocketHandler() {
        return createWebsocketLambda(this.context);
    }

    createPublishHandler() {
        return createPublishMessageLambda(this.context);
    }
}
