import { ChannelManager } from './ChannelManager';
import { WebSocketConnectionManager } from './WebSocketConnectionManager';
import { WebSocketSubscriptionManager } from './WebSocketSubscriptionManager';

const connectionManager = new WebSocketConnectionManager();
const subscriptionManager = new WebSocketSubscriptionManager(connectionManager);
const channelManager = new ChannelManager();

export { connectionManager, subscriptionManager, channelManager };

