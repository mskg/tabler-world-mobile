import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { OperationMessagePayload } from 'subscriptions-transport-ws';
import { IConnectionStorage } from '../core/types/IConnectionStorage';
import { IEventStorage } from '../core/types/IEventStorage';
import { IPushSubscriptionManager } from '../core/types/IPushSubscriptionManager';
import { ISubscriptionStorage } from '../core/types/ISubscriptionStorage';
import { WebsocketEvent } from '../core/types/WebsocketEvent';
import { ITransportEncoder } from '../core/types/ITransportEncoder';

export type ContextFuncArgs<TConnectionContext> = {
    eventId: string,
    connectionId: string,

    principal: IPrincipal,
    context: TConnectionContext,
};

export type ContextFunc<TConnectionContext, TResolverContext> = (arg: ContextFuncArgs<TConnectionContext>) => Promise<TResolverContext>;

export type AuthenticateFunc<TConnectionContext> = (payload: OperationMessagePayload | undefined) => Promise<{
    principal: IPrincipal,
    extraInfo?: TConnectionContext,
}>;

export type HandlePushFunc = () => Promise<void>;
export type EndRequestFunc<TResolverContext> = (arg: TResolverContext) => Promise<void>;

export type MessageSentFunc<TResolverContext> = (arg: {
    context: TResolverContext,
    event: WebsocketEvent<any>,
    principal: IPrincipal,
}) => Promise<void>;

export interface Config<TConnectionContext, TResolverContext> {
    services: {
        connections: IConnectionStorage;
        subscriptions: ISubscriptionStorage;
        events: IEventStorage;
        push: IPushSubscriptionManager;
        encoder?: ITransportEncoder<any, any>;

        cache: IManyKeyValueCache<string> & KeyValueCache<string>;
    };

    schema: GraphQLSchema;

    onConnect: AuthenticateFunc<TConnectionContext>;
    onSubscriptionCreated: EndRequestFunc<TResolverContext>;
    onCreateContext: ContextFunc<TConnectionContext, TResolverContext>;
    onEventSent: MessageSentFunc<TResolverContext>;
}
