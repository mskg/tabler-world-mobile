import { Conversation } from './Conversation';
import { PaggedResponse } from './PaggedResponse';
import { QueryOptions } from './QueryOptions';
import { UserConversation } from './UserConversation';

export interface IConversationStorage {
    getConversations(member: number, options: QueryOptions): Promise<PaggedResponse<string>>;
    getConversation(conversation: string): Promise<Conversation>;

    getUserConversation(conversation: string, member: number): Promise<UserConversation>;

    update(conversation: string, eventId: string): Promise<void>;
    updateLastSeen(conversation: string, member: number, lastSeen: string): Promise<void>;

    removeMembers(conversation: string, members: number[]): Promise<void>;
    addMembers(conversation: string, members: number[]): Promise<void>;
}
