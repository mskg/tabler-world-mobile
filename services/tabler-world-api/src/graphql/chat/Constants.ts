export const DIRECT_CHAT_PREFIX = `CONV(`;
export const DIRECT_CHAT_SUFFIX = `)`;

export const MEMBER_SEPERATOR = ',';
export const MEMBER_ENCLOSING = ':';

export const ALL_CHANNEL_PREFIX = `ALL(${MEMBER_ENCLOSING}`;
export const ALL_CHANNEL_SUFFIX = `${MEMBER_ENCLOSING})`;

export const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE as string;
export const SUBSCRIPTIONS_TABLE = process.env.SUBSCRIPTIONS_TABLE as string;
export const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE as string;
export const EVENTS_TABLE = process.env.EVENTS_TABLE as string;
export const PUSH_SUBSCRIPTIONS_TABLE = process.env.PUSH_SUBSCRIPTIONS_TABLE as string;

export enum FieldNames {
    member = 'memberId',
    members = 'members',
    lastMessage = 'lastMessage',
    lastConversation = 'last_conversation',
    lastSeen = 'lastSeen',
    conversation = 'conversation',
}
