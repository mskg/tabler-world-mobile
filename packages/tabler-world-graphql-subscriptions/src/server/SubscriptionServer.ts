import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { ServerlessOfflineEventStorage } from '../implementations/debug/ServerlessOfflineEventStorage';
import { createPublishMessageLambda } from '../lambda/createPublishMessageLambda';
import { createWebsocketLambda } from '../lambda/createWebsocketLambda';
import { Config } from './Config';
import { SubscriptionServerContext } from './SubscriptionServerContext';

export class SubscriptionServer<TConnectionContext = any, TResolverContext = any> {
    context: SubscriptionServerContext<TConnectionContext, TResolverContext>;

    constructor(public readonly config: Config<TConnectionContext, TResolverContext>) {
        if (EXECUTING_OFFLINE) {
            this.context = new SubscriptionServerContext({
                ...config,
                services: {
                    ...config.services,
                    events: new ServerlessOfflineEventStorage(this),
                },
            });
        } else {
            this.context = new SubscriptionServerContext(config);
        }
    }

    get subscriptionManager() {
        return this.context.subscriptionManager;
    }

    get eventManager() {
        return this.context.eventManager;
    }

    createWebsocketHandler() {
        return createWebsocketLambda(this.context);
    }

    createPublishHandler() {
        return createPublishMessageLambda(this.context);
    }
}
