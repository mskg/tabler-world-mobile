import { ConsoleLogger } from '@mskg/tabler-world-common';
import { redisConfig } from '../../cache/redisCache';
import { Environment } from '../../Environment';
import { dynamodb } from '../aws/dynamodb';
import { RedisStorage } from '../aws/RedisStorage';
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
    const redis = new RedisStorage(
        redisConfig,
        new ConsoleLogger('RedisStorage'),
    );

    connectionManager = new WebsocketConnectionManager(new RedisConnectionStorage(redis));
    subscriptionManager = new WebsocketSubscriptionManager(
        connectionManager,
        new RedisSubscriptionStorage(redis),
    );

    conversationManager = new ConversationManager(
        new RedisConversationStorage(
            new DynamoDBConversationStorage(dynamodb),
            redis,
        ),
    );

} else {
    connectionManager = new WebsocketConnectionManager(new DynamoDBConnectionStore(dynamodb));
    subscriptionManager = new WebsocketSubscriptionManager(
        connectionManager,
        new DynamoDBSubcriptionStorage(dynamodb),
    );

    conversationManager = new ConversationManager(new DynamoDBConversationStorage(dynamodb));
}

const eventManager = new WebsocketEventManager();
const pushSubscriptionManager = new PushSubcriptionManager();

export { pushSubscriptionManager, connectionManager, subscriptionManager, conversationManager, eventManager };

