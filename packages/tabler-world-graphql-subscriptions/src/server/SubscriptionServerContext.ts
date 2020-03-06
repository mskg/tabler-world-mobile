import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { WebsocketConnectionManager } from '../core/services/WebsocketConnectionManager';
import { WebsocketEventManager } from '../core/services/WebsocketEventManager';
import { WebsocketSubscriptionManager } from '../core/services/WebsocketSubscriptionManager';
import { IPushSubscriptionManager } from '../core/types/IPushSubscriptionManager';
import { awsGatewayClient } from '../implementations/awsGatewayClient';
import { AuthenticateFunc, Config, ContextFunc, EndRequestFunc, MessageSentFunc } from './Config';

export class SubscriptionServerContext<TConnectionContext, TResolverContext> {
    public readonly gatewayClient: typeof awsGatewayClient;

    public readonly connectionManager: WebsocketConnectionManager<TConnectionContext>;
    public readonly subscriptionManager: WebsocketSubscriptionManager<TConnectionContext>;

    public readonly eventManager: WebsocketEventManager;
    public readonly cache: IManyKeyValueCache<string> & KeyValueCache<string>;
    public readonly pushSubscriptionManager: IPushSubscriptionManager;

    public readonly schema: GraphQLSchema;

    // events
    public readonly createContext: ContextFunc<TConnectionContext, TResolverContext>;
    public readonly authenticate: AuthenticateFunc<TConnectionContext>;
    public readonly subscriptionCreated: EndRequestFunc<TResolverContext>;
    public readonly eventSent: MessageSentFunc<TResolverContext>;

    constructor(config: Config<TConnectionContext, TResolverContext>) {
        this.gatewayClient = awsGatewayClient;

        this.connectionManager = new WebsocketConnectionManager(config.services.connections);
        this.subscriptionManager = new WebsocketSubscriptionManager(this.connectionManager, config.services.subscriptions);
        this.eventManager = new WebsocketEventManager(config.services.events, config.services.encryption);

        this.pushSubscriptionManager = config.services.push;

        // basics
        this.cache = config.services.cache;
        this.schema = config.schema;

        // events
        this.createContext = config.createContext;
        this.authenticate = config.authenticate;
        this.subscriptionCreated = config.subscriptionCreated;
        this.eventSent = config.eventSent;
    }
}
