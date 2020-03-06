import { resolveWebsocketPrincipal } from '@mskg/tabler-world-auth-client';
import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { Audit, ConsoleLogger, Metric } from '@mskg/tabler-world-common';
import { DynamoDBConnectionStore, DynamoDBEventStorage, DynamoDBSubcriptionStorage, RedisConnectionStorage, RedisSubscriptionStorage, SubscriptionServer, TweetNaClEnryptionManager } from '@mskg/tabler-world-graphql-subscriptions';
import { AuthenticationError } from 'apollo-server-core';
import { createHash } from 'crypto';
import { cacheInstance } from './cache/cacheInstance';
import { ConversationManager } from './chat/ConversationManager';
import { DynamoDBConversationStorage } from './chat/DynamoDBConversationStorage';
import { IConversationStorage } from './chat/IConversationStorage';
import { RedisConversationStorage } from './chat/RedisConversationStorage';
import { dataSources } from './dataSources';
import { Environment } from './Environment';
import { executableSchema } from './executableSchema';
import { createDynamoDBInstance } from './helper/createDynamoDBInstance';
import { createIORedisClient } from './helper/createIORedisClient';
import { extractDeviceID, extractPlatform, extractVersion } from './helper/extractVersion';
import { createLimiter } from './ratelimit/createLimiter';
import { getChatParams } from './chat/getChatParams';
import { IConnectionContext } from './types/IApolloContext';
import { ISubscriptionContext } from './types/ISubscriptionContext';
import { DynamoDBPushSubscriptionManager } from './chat/DynamoDBPushSubscriptionManager';

let connections;
let subscriptions;
let conversationStorage: IConversationStorage;

if (Environment.Caching.useRedis) {
    connections = new RedisConnectionStorage(createIORedisClient());
    subscriptions = new RedisSubscriptionStorage(createIORedisClient());
    conversationStorage = new RedisConversationStorage(
        new DynamoDBConversationStorage(createDynamoDBInstance()),
        createIORedisClient(),
    );
} else {
    connections = new DynamoDBConnectionStore(createDynamoDBInstance());
    subscriptions = new DynamoDBSubcriptionStorage(createDynamoDBInstance());
    conversationStorage = new DynamoDBConversationStorage(createDynamoDBInstance());
}

const events = new DynamoDBEventStorage(createDynamoDBInstance());
export const pushSubscriptionManager = new DynamoDBPushSubscriptionManager(createDynamoDBInstance());

function hash(address: string) {
    return createHash('md5')
        .update(address.toLocaleLowerCase())
        .digest('hex');
}

const logger = new ConsoleLogger('ws');
export const conversationManager = new ConversationManager(conversationStorage);

const server = new SubscriptionServer<IConnectionContext, ISubscriptionContext>({
    schema: executableSchema,

    services: {
        connections,
        events,
        subscriptions,
        push: pushSubscriptionManager,
        cache: cacheInstance,
        encryption: new TweetNaClEnryptionManager(async () => {
            const params = await getChatParams();
            return params.masterKey;
        }),
    },

    authenticate: async (payload) => {
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
    eventSent: async ({ context, event, principal }) => {
        context.metrics.dump();
        context.auditor.dump();

        if (event.trackDelivery) {
            await conversationManager.updateLastSeen(event.eventName, principal.id, event.id);
        }
    },

    // we dump the results
    subscriptionCreated: async (context) => {
        context.metrics.dump();
        context.auditor.dump();
    },

    createContext: async ({ connectionId, context, eventId, principal }) => {
        return {
            principal,
            connectionId,
            getLimiter: createLimiter,
            metrics: new Metric(),
            logger: new ConsoleLogger(eventId, connectionId),
            auditor: new Audit(eventId, `${principal.id}:${principal.email}`, context.device),
            cache: cacheInstance,
            clientInfo: context,
            dataSources: dataSources(),
            requestCache: {},
        };
    },
});

export const websocketServer = server;
export const eventManager = server.eventManager;
export const subscriptionManager = server.subscriptionManager;
