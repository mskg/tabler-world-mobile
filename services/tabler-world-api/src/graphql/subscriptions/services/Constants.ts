
export const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE as string;
export const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE as string;
export const EVENTS_TABLE = process.env.EVENTS_TABLE as string;
export const SUBSCRIPTIONS_TABLE = process.env.SUBSCRIPTIONS_TABLE as string;
export const PUSH_SUBSCRIPTIONS_TABLE = process.env.PUSH_SUBSCRIPTIONS_TABLE as string;

export enum FieldNames {
    id = 'id',
    member = 'memberId',
    connectionId = 'connectionId',
    payload = 'payload',
    subscriptionId = 'subscriptionId',
    members = 'members',
    conversation = 'conversation',
    principal = 'principal',
    context = 'context',
    trigger = 'eventName',
    subscription = 'subscription',
    lastMessage = 'lastMessage',
    lastConversation = 'last_conversation',
    lastSeen = 'lastSeen',
    channelKey = 'channelKey',
}
