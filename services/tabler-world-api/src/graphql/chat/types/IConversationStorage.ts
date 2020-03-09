import { PaggedResponse, QueryOptions } from '@mskg/tabler-world-lambda-subscriptions';
import { Conversation } from './Conversation';
import { UserConversation } from './UserConversation';

export interface IConversationStorage {
    getConversations(member: number, options: QueryOptions): Promise<PaggedResponse<string>>;
    getConversation(conversation: string): Promise<Conversation>;

    getUserConversation(conversation: string, member: number): Promise<UserConversation | undefined>;

    update(conversation: string, eventId: string): Promise<void>;
    updateLastSeen(conversation: string, member: number, lastSeen: string): Promise<void>;

    removeMembers(conversation: string, members: number[]): Promise<void>;
    addMembers(conversation: string, members: number[]): Promise<void>;
}
