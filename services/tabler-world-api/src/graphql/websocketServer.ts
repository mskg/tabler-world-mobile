import { IPrincipal, resolveWebsocketPrincipal } from '@mskg/tabler-world-auth-client';
import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { Audit, ConsoleLogger, Metric } from '@mskg/tabler-world-common';
import { DynamoDBConnectionStore, DynamoDBEventStorage, DynamoDBSubcriptionStorage, RedisConnectionStorage, RedisSubscriptionStorage, ServerlessOfflineEventStorage, SubscriptionServer } from '@mskg/tabler-world-lambda-subscriptions';
import { AuthenticationError } from 'apollo-server-core';
import { createHash } from 'crypto';
import { cacheInstance } from './cache/cacheInstance';
import { CONNECTIONS_TABLE, EVENTS_TABLE, SUBSCRIPTIONS_TABLE } from './chat/Constants';
import { DynamoDBConversationStorage } from './chat/implementations/DynamoDBConversationStorage';
import { DynamoDBPushSubscriptionManager } from './chat/implementations/DynamoDBPushSubscriptionManager';
import { NaClEncryptionEncoder } from './chat/implementations/NaClEncryptionEncoder';
import { RedisConversationStorage } from './chat/implementations/RedisConversationStorage';
import { ConversationManager } from './chat/services/ConversationManager';
import { EventManager } from './chat/services/EventManager';
import { IConversationStorage } from './chat/types/IConversationStorage';
import { dataSources } from './dataSources';
import { Environment } from './Environment';
import { executableSchema } from './executableSchema';
import { createDynamoDBInstance } from './helper/createDynamoDBInstance';
import { createIORedisClient } from './helper/createIORedisClient';
import { extractDeviceID, extractPlatform, extractVersion } from './helper/extractVersion';
import { createLimiter } from './ratelimit/createLimiter';
import { IConnectionContext } from './types/IApolloContext';
import { ISubscriptionContext } from './types/ISubscriptionContext';

const logger = new ConsoleLogger('ws');

function hash(txt: string) {
    return createHash('md5')
        .update(txt.toLocaleLowerCase())
        .digest('hex');
}

let connectionStorage;
let subscriptionStorage;
let conversationStorage: IConversationStorage;

if (Environment.Caching.useRedis) {
    connectionStorage = new RedisConnectionStorage(createIORedisClient());
    subscriptionStorage = new RedisSubscriptionStorage(createIORedisClient());
    conversationStorage = new RedisConversationStorage(
        new DynamoDBConversationStorage(createDynamoDBInstance()),
        createIORedisClient(),
    );
} else {
    connectionStorage = new DynamoDBConnectionStore(CONNECTIONS_TABLE, createDynamoDBInstance());
    subscriptionStorage = new DynamoDBSubcriptionStorage(SUBSCRIPTIONS_TABLE, createDynamoDBInstance());
    conversationStorage = new DynamoDBConversationStorage(createDynamoDBInstance());
}

// this anables the debugHook for serverless offline
export const eventsStorage = EXECUTING_OFFLINE ?
    new ServerlessOfflineEventStorage(
        new DynamoDBEventStorage(EVENTS_TABLE, createDynamoDBInstance()),
        (a: any) => { server.createPublishHandler()(a); },
    )
    : new DynamoDBEventStorage(EVENTS_TABLE, createDynamoDBInstance());

export const pushSubscriptionManager = new DynamoDBPushSubscriptionManager(createDynamoDBInstance());

const encoder = new NaClEncryptionEncoder();
export const conversationManager = new ConversationManager(conversationStorage);

const server = new SubscriptionServer<IConnectionContext, ISubscriptionContext>({
    schema: executableSchema,

    services: {
        encoder,
        connections: connectionStorage,
        subscriptions: subscriptionStorage,
        events: eventsStorage,
        push: pushSubscriptionManager,
        cache: cacheInstance,
    },

    onConnect: async (payload) => {
        // @ts-ignore
        const { Authorization: token } = payload;
        if (token == null) throw new AuthenticationError('No token provided');

        const principal = await cachedLoad(
            {
                logger,
                cache: cacheInstance,
            },
            makeCacheKey('Principal', [hash(token)]),
            () => resolveWebsocketPrincipal({ payload }),
            'Principal',
        );

        logger.log('resolved', principal);
        return {
            principal,
            extraInfo: {
                version: extractVersion(payload || {}),
                os: extractPlatform(payload || {}),
                device: extractDeviceID(payload || {}),
            },
        };
    },

    // we update last seen
    onEventSent: async ({ context, event, principal }) => {
        context.metrics.dump();
        context.auditor.dump();

        if (event.trackDelivery) {
            await conversationManager.updateLastSeen(event.eventName, principal.id, event.id);
        }
    },

    // we dump the results
    onSubscriptionCreated: async (context) => {
        context.metrics.dump();
        context.auditor.dump();
    },

    onCreateContext: async ({ connectionId, context, eventId, principal }) => {
        return {
            connectionId,
            principal: principal as IPrincipal,
            getLimiter: createLimiter,
            metrics: new Metric(),

            logger: new ConsoleLogger(eventId, connectionId),
            sqlLogLevel: Environment.DB.sqlLogLevel,

            auditor: new Audit(eventId, `${principal.id}:${principal.email}`, context.device),
            cache: cacheInstance,
            clientInfo: context,
            dataSources: dataSources(),
            requestCache: {},
        };
    },
});

export const websocketServer = server;
export const subscriptionManager = server.subscriptionManager;

// instances are decorated, we have to use the updated instacne
export const eventManager = new EventManager(
    server.eventStorage,
);
