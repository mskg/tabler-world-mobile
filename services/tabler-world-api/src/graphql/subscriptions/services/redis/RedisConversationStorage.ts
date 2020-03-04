import { IORedisClient } from '@mskg/tabler-world-cache';
import { Conversation } from '../../types/Conversation';
import { IConversationStorage } from '../../types/IConversationStorage';
import { PaggedResponse } from '../../types/PaggedResponse';
import { QueryOptions } from '../../types/QueryOptions';
import { UserConversation } from '../../types/UserConversation';

const conversationKey = (conversation: string) => `chat:${conversation}`;
const userKey = (conversation: string, member: number) => `chat:${conversation}:${member}`;
const TTL = 10 * 60;

export class RedisConversationStorage implements IConversationStorage {
    constructor(
        private storage: IConversationStorage,
        private cache: IORedisClient,
    ) {
    }

    public getConversations(member: number, options: QueryOptions): Promise<PaggedResponse<string>> {
        return this.storage.getConversations(member, options);
    }

    public async getConversation(conversation: string): Promise<Conversation> {
        const existing = await this.cache.get<Conversation>(conversationKey(conversation));
        if (existing) { return existing; }

        const newValue = await this.storage.getConversation(conversation);
        if (newValue) {
            await this.cache.set(conversationKey(conversation), newValue, TTL);
        }

        return newValue;
    }

    public async updateLastSeen(conversation: string, member: number, lastSeen: string): Promise<void> {
        await this.cache.set(userKey(conversation, member), lastSeen, TTL);
        return this.storage.updateLastSeen(conversation, member, lastSeen);
    }

    public async getUserConversation(conversation: string, member: number): Promise<UserConversation> {
        const existing = await this.cache.get<UserConversation>(userKey(conversation, member));
        if (existing) { return existing; }

        const newValue = await this.storage.getUserConversation(conversation, member);
        if (newValue) {
            await this.cache.set(userKey(conversation, member), newValue, TTL);
        }

        return newValue;
    }

    public async update(conversation: string, eventId: string): Promise<void> {
        await this.cache.del(conversationKey(conversation));
        return this.storage.update(conversation, eventId);
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        await this.cache.del(
            conversationKey(conversation),
            ...members.map((m) => userKey(conversation, m)),
        );
        return this.storage.removeMembers(conversation, members);
    }

    public async addMembers(conversation: string, members: number[]): Promise<void> {
        await this.cache.del(
            conversationKey(conversation),
            ...members.map((m) => userKey(conversation, m)),
        );
        return this.storage.addMembers(conversation, members);
    }
}