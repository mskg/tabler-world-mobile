import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { WebsocketConnectionManager } from '../services/WebsocketConnectionManager';
import { WebsocketSubscriptionManager } from '../services/WebsocketSubscriptionManager';
import { IEventStorage } from '../types/IEventStorage';
import { IPushSubscriptionManager } from '../types/IPushSubscriptionManager';
import { ITransportEncoder } from '../types/ITransportEncoder';
import { awsGatewayClient } from '../implementations/awsGatewayClient';
import { EncodingWrapper } from '../implementations/encoded/EncodingWrapper';
import { AuthenticateFunc, Config, ContextFunc, EndRequestFunc, MessageSentFunc } from './Config';

export interface ITTL {
    connection: number;
    subscription: number;
}

export class SubscriptionServerContext<TConnectionContext, TResolverContext> {
    public readonly gatewayClient: typeof awsGatewayClient;

    public readonly connectionManager: WebsocketConnectionManager<TConnectionContext>;
    public readonly subscriptionManager: WebsocketSubscriptionManager<TConnectionContext>;

    public readonly pushSubscriptionManager?: IPushSubscriptionManager;

    public readonly eventStorage: IEventStorage;
    public readonly cache: IManyKeyValueCache<string> & KeyValueCache<string>;
    public readonly encoder: ITransportEncoder<any, any>;

    public readonly schema: GraphQLSchema;

    // events
    public readonly onCreateContext?: ContextFunc<TConnectionContext, TResolverContext>;
    public readonly onAuthenticate?: AuthenticateFunc<TConnectionContext>;
    public readonly onSubscriptionCreated?: EndRequestFunc<TResolverContext>;
    public readonly onEventSent?: MessageSentFunc<TResolverContext>;

    public readonly ttl: ITTL;

    constructor(config: Config<TConnectionContext, TResolverContext>) {
        this.gatewayClient = awsGatewayClient;

        // ttl
        this.ttl = {
            connection: 60 * 60 * 4,
            subscription: 60 * 60 * 4,
            ... (config.ttl || {}),
        };

        this.connectionManager = new WebsocketConnectionManager(this.ttl, config.services.connections);
        this.subscriptionManager = new WebsocketSubscriptionManager(this.ttl, this.connectionManager, config.services.subscriptions);

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

        if (config.services.encoder) {
            this.eventStorage = new EncodingWrapper(
                this.encoder,
                config.services.events,
            );
        } else {
            this.eventStorage = config.services.events;
        }
    }
}
