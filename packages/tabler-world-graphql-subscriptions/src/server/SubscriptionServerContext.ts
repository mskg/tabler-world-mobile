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
    public readonly onCreateContext: ContextFunc<TConnectionContext, TResolverContext>;
    public readonly onAuthenticate: AuthenticateFunc<TConnectionContext>;
    public readonly onSubscriptionCreated: EndRequestFunc<TResolverContext>;
    public readonly onEventSent: MessageSentFunc<TResolverContext>;

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
        this.onCreateContext = config.onCreateContext;
        this.onAuthenticate = config.onConnect;
        this.onSubscriptionCreated = config.onSubscriptionCreated;
        this.onEventSent = config.onEventSent;

        // encoding
        this.encoder = config.services.encoder || {
            encode: (e) => Promise.resolve(e),
            decode: (e) => Promise.resolve(e),
        };
    }
}
