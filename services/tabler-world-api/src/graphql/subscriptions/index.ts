import { ConversationManager } from './services/ConversationManager';
import { WebsocketConnectionManager } from './services/WebsocketConnectionManager';
import { WebsocketEventManager } from './services/WebsocketEventManager';
import { WebsocketSubscriptionManager } from './services/WebsocketSubscriptionManager';

const connectionManager = new WebsocketConnectionManager();
const subscriptionManager = new WebsocketSubscriptionManager(connectionManager);
const conversationManager = new ConversationManager();
const eventManager = new WebsocketEventManager();

export { connectionManager, subscriptionManager, conversationManager, eventManager };

