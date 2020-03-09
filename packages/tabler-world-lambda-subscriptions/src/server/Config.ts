import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { OperationMessagePayload } from 'subscriptions-transport-ws';
import { AuthenticatedUser } from '../types/AuthenticatedUser';
import { IConnectionStorage } from '../types/IConnectionStorage';
import { IEventStorage } from '../types/IEventStorage';
import { IPushSubscriptionManager } from '../types/IPushSubscriptionManager';
import { ISubscriptionStorage } from '../types/ISubscriptionStorage';
import { ITransportEncoder } from '../types/ITransportEncoder';
import { AnyWebsocketEvent } from '../types/WebsocketEvent';

export type ContextFuncArgs<TConnectionContext> = {
    eventId: string,
    connectionId: string,

    principal: AuthenticatedUser,
    context: TConnectionContext,
};

export type ContextFunc<TConnectionContext, TResolverContext> = (arg: ContextFuncArgs<TConnectionContext>) => Promise<TResolverContext>;

export type AuthenticateFunc<TConnectionContext> = (payload: OperationMessagePayload | undefined) => Promise<{
    principal: AuthenticatedUser,
    extraInfo?: TConnectionContext,
}>;

export type HandlePushFunc = () => Promise<void>;
export type EndRequestFunc<TResolverContext> = (arg: TResolverContext) => Promise<void>;

export type MessageSentFunc<TResolverContext> = (arg: {
    context: TResolverContext,
    event: AnyWebsocketEvent,
    principal: AuthenticatedUser,
}) => Promise<void>;

export interface Config<TConnectionContext, TResolverContext> {
    services: {
        cache: IManyKeyValueCache<string> & KeyValueCache<string>;

        connections: IConnectionStorage;
        subscriptions: ISubscriptionStorage;
        events: IEventStorage;

        push?: IPushSubscriptionManager;
        encoder?: ITransportEncoder<any, any, any, any>;
    };

    ttl?: {
        connection?: number,
        subscription?: number,
    };

    schema: GraphQLSchema;

    onConnect?: AuthenticateFunc<TConnectionContext>;
    onSubscriptionCreated?: EndRequestFunc<TResolverContext>;
    onCreateContext?: ContextFunc<TConnectionContext, TResolverContext>;
    onEventSent?: MessageSentFunc<TResolverContext>;
}
