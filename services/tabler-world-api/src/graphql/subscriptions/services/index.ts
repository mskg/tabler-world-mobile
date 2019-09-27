import { ConversationManager } from './ConversationManager';
import { WebsocketConnectionManager } from './WebsocketConnectionManager';
import { WebsocketEventManager } from './WebsocketEventManager';
import { WebsocketSubscriptionManager } from './WebsocketSubscriptionManager';

const connectionManager = new WebsocketConnectionManager();
const subscriptionManager = new WebsocketSubscriptionManager(connectionManager);
const conversationManager = new ConversationManager();
const eventManager = new WebsocketEventManager();

export { connectionManager, subscriptionManager, conversationManager, eventManager };

