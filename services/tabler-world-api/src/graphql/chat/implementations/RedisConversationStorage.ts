import { IORedisClient } from '@mskg/tabler-world-cache';
import { PaggedResponse, QueryOptions } from '@mskg/tabler-world-lambda-subscriptions';
import { Conversation } from '../types/Conversation';
import { IConversationStorage } from '../types/IConversationStorage';
import { UserConversation } from '../types/UserConversation';

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
        await this.cache.del(userKey(conversation, member));
        await this.storage.updateLastSeen(conversation, member, lastSeen);
    }

    public async getUserConversation(conversation: string, member: number): Promise<UserConversation | undefined> {
        const existing = await this.cache.get<UserConversation>(userKey(conversation, member));
        if (existing) { return existing; }

        const newValue = await this.storage.getUserConversation(conversation, member);
        if (newValue) {
            await this.cache.set(userKey(conversation, member), newValue, TTL);
        }

        return newValue;
    }

    // TODO: this should also remove all user keys
    public async update(conversation: string, eventId: string): Promise<void> {
        await this.cache.del(conversationKey(conversation));
        await this.storage.update(conversation, eventId);
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        await this.cache.del(
            conversationKey(conversation),
            ...members.map((m) => userKey(conversation, m)),
        );
        await this.storage.removeMembers(conversation, members);
    }

    public async addMembers(conversation: string, members: number[]): Promise<void> {
        await this.cache.del(
            conversationKey(conversation),
            ...members.map((m) => userKey(conversation, m)),
        );
        await this.storage.addMembers(conversation, members);
    }
}
