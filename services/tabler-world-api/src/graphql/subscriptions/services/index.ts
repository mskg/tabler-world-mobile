import { Environment } from '../../Environment';
import { createDynamoDBInstance } from '../../helper/createDynamoDBInstance';
import { createIORedisClient } from '../../helper/createIORedisClient';
import { ConversationManager } from './ConversationManager';
import { DynamoDBConnectionStore } from './dynamodb/DynamoDBConnectionStore';
import { DynamoDBConversationStorage } from './dynamodb/DynamoDBConversationStorage';
import { DynamoDBSubcriptionStorage } from './dynamodb/DynamoDBSubcriptionStorage';
import { PushSubcriptionManager } from './PushSubcriptionManager';
import { RedisConnectionStorage } from './redis/RedisConnectionStorage';
import { RedisConversationStorage } from './redis/RedisConversationStorage';
import { RedisSubscriptionStorage } from './redis/RedisSubscriptionStorage';
import { WebsocketConnectionManager } from './WebsocketConnectionManager';
import { WebsocketEventManager } from './WebsocketEventManager';
import { WebsocketSubscriptionManager } from './WebsocketSubscriptionManager';

let connectionManager: WebsocketConnectionManager;
let subscriptionManager: WebsocketSubscriptionManager;
let conversationManager: ConversationManager;

if (Environment.Caching.useRedis) {
    connectionManager = new WebsocketConnectionManager(
        new RedisConnectionStorage(createIORedisClient()),
    );

    subscriptionManager = new WebsocketSubscriptionManager(
        connectionManager,
        new RedisSubscriptionStorage(createIORedisClient()),
    );

    conversationManager = new ConversationManager(
        new RedisConversationStorage(
            new DynamoDBConversationStorage(createDynamoDBInstance()),
            createIORedisClient(),
        ),
    );
} else {
    connectionManager = new WebsocketConnectionManager(
        new DynamoDBConnectionStore(createDynamoDBInstance()),
    );

    subscriptionManager = new WebsocketSubscriptionManager(
        connectionManager,
        new DynamoDBSubcriptionStorage(createDynamoDBInstance()),
    );

    conversationManager = new ConversationManager(new DynamoDBConversationStorage(createDynamoDBInstance()));
}

const eventManager = new WebsocketEventManager(createDynamoDBInstance());
const pushSubscriptionManager = new PushSubcriptionManager(createDynamoDBInstance());

export { pushSubscriptionManager, connectionManager, subscriptionManager, conversationManager, eventManager };

