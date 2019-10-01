import { ConversationManager } from './ConversationManager';
import { PushSubcriptionManager } from './PushSubcriptionManager';
import { WebsocketConnectionManager } from './WebsocketConnectionManager';
import { WebsocketEventManager } from './WebsocketEventManager';
import { WebsocketSubscriptionManager } from './WebsocketSubscriptionManager';

const connectionManager = new WebsocketConnectionManager();
const subscriptionManager = new WebsocketSubscriptionManager(connectionManager);
const conversationManager = new ConversationManager();
const eventManager = new WebsocketEventManager();
const pushSubscriptionManager = new PushSubcriptionManager();

export { pushSubscriptionManager, connectionManager, subscriptionManager, conversationManager, eventManager };
