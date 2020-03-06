import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { KeyValueCache } from 'apollo-server-core';
import { GraphQLSchema } from 'graphql';
import { OperationMessagePayload } from 'subscriptions-transport-ws';
import { IConnectionStorage } from '../core/types/IConnectionStorage';
import { IEncryptionManager } from '../core/types/IEncryptionManager';
import { IEventStorage } from '../core/types/IEventStorage';
import { IPushSubscriptionManager } from '../core/types/IPushSubscriptionManager';
import { ISubscriptionStorage } from '../core/types/ISubscriptionStorage';
import { WebsocketEvent } from '../core/types/WebsocketEvent';

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

        encryption: IEncryptionManager;
        cache: IManyKeyValueCache<string> & KeyValueCache<string>;
    };

    schema: GraphQLSchema;

    authenticate: AuthenticateFunc<TConnectionContext>;
    createContext: ContextFunc<TConnectionContext, TResolverContext>;

    eventSent: MessageSentFunc<TResolverContext>;
    subscriptionCreated: EndRequestFunc<TResolverContext>;
}
