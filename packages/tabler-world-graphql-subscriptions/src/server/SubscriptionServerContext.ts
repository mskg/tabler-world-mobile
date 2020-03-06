import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { WebsocketConnectionManager } from '../core/services/WebsocketConnectionManager';
import { WebsocketSubscriptionManager } from '../core/services/WebsocketSubscriptionManager';
import { IEventStorage } from '../core/types/IEventStorage';
import { IPushSubscriptionManager } from '../core/types/IPushSubscriptionManager';
import { ITransportEncoder } from '../core/types/ITransportEncoder';
import { awsGatewayClient } from '../implementations/awsGatewayClient';
import { AuthenticateFunc, Config, ContextFunc, EndRequestFunc, MessageSentFunc } from './Config';

export class SubscriptionServerContext<TConnectionContext, TResolverContext> {
    public readonly gatewayClient: typeof awsGatewayClient;

    public readonly connectionManager: WebsocketConnectionManager<TConnectionContext>;
    public readonly subscriptionManager: WebsocketSubscriptionManager<TConnectionContext>;

    public readonly eventStorage: IEventStorage;
    public readonly cache: IManyKeyValueCache<string> & KeyValueCache<string>;
    public readonly pushSubscriptionManager: IPushSubscriptionManager;
    public readonly encoder: ITransportEncoder<any, any>;

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
        this.eventStorage = config.services.events;

        this.pushSubscriptionManager = config.services.push;

        // basics
        this.cache = config.services.cache;
        this.schema = config.schema;

        // events
        this.createContext = config.createContext;
        this.authenticate = config.authenticate;
        this.subscriptionCreated = config.subscriptionCreated;
        this.eventSent = config.eventSent;

        // encoding
        this.encoder = config.services.encoder || {
            encode: (e) => Promise.resolve(e),
            decode: (e) => Promise.resolve(e),
        };
    }
}
