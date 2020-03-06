export const DIRECT_CHAT_PREFIX = `CONV(`;
export const DIRECT_CHAT_SUFFIX = `)`;

export const MEMBER_SEPERATOR = ',';
export const MEMBER_ENCLOSING = ':';

export const ALL_CHANNEL_PREFIX = `ALL(${MEMBER_ENCLOSING}`;
export const ALL_CHANNEL_SUFFIX = `${MEMBER_ENCLOSING})`;

export const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE as string;
export const EVENTS_TABLE = process.env.EVENTS_TABLE as string;
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
