
export const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE as string;
export const CHANNELS_TABLE = process.env.CHANNELS_TABLE as string;
export const EVENTS_TABLE = process.env.EVENTS_TABLE as string;

export enum FieldNames {
    member = 'memberId',
    connectionId = 'connectionId',
    payload = 'payload',
    subscriptionId = 'subscriptionId',
    members = 'members',
    channel = 'channel',
    principal = 'principal',
}
