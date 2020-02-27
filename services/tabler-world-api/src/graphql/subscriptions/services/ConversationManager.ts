import { ConsoleLogger } from '@mskg/tabler-world-common';
import { ALL_CHANNEL_PREFIX, ALL_CHANNEL_SUFFIX, DIRECT_CHAT_PREFIX, DIRECT_CHAT_SUFFIX, MEMBER_ENCLOSING, MEMBER_SEPERATOR } from '../types/Constants';
import { Conversation } from '../types/Conversation';
import { IConversationStorage } from '../types/IConversationStorage';
import { PaggedResponse } from '../types/PaggedResponse';
import { QueryOptions } from '../types/QueryOptions';
import { UserConversation } from '../types/UserConversation';
import { WebsocketEvent } from '../types/WebsocketEvent';

const logger = new ConsoleLogger('chat:conversation');

export class ConversationManager {
    /**
     * CONV(:1:,:2:)
     * @param members
     */
    // tslint:disable-next-line: function-name
    public static MakeConversationKey(member1: number, member2: number): string {
        return `${DIRECT_CHAT_PREFIX}${[member1, member2].sort().map((m) => `${MEMBER_ENCLOSING}${m}${MEMBER_ENCLOSING}`).join(MEMBER_SEPERATOR)}${DIRECT_CHAT_SUFFIX}`;
    }

    /**
     * ALL(:1:)
     * @param member
     */
    // tslint:disable-next-line: function-name
    public static MakeAllConversationKey(member: number): string {
        return `${ALL_CHANNEL_PREFIX}${member}${ALL_CHANNEL_SUFFIX}`;
    }

    constructor(
        private storage: IConversationStorage,
    ) {
    }

    public async getConversations(member: number, options: QueryOptions = { pageSize: 10 }): Promise<PaggedResponse<string>> {
        logger.log('getConversations', member);
        return this.storage.getConversations(member, options);
    }

    public async getConversation(conversation: string): Promise<Conversation> {
        logger.log(`[${conversation}]`, 'get');
        return this.storage.getConversation(conversation);
    }

    public async getUserConversation(conversation: string, member: number): Promise<UserConversation> {
        logger.log(`[${conversation}]`, 'getUserConversation', member);
        return this.storage.getUserConversation(conversation, member);
    }

    /**
     * Updates the lastseen timestamp for a given conversation and memmber.
     *
     * @param conversation
     * @param member
     * @param lastSeen
     */
    public async updateLastSeen(conversation: string, member: number, lastSeen: string) {
        logger.log(`[${conversation}]`, 'updateLastSeen', member, lastSeen);
        return this.storage.updateLastSeen(conversation, member, lastSeen);
    }

    /**
     * Updates conversation information with latest update
     *
     * @param conversation
     * @param param1
     */
    public async update(conversation: string, { id: eventId }: WebsocketEvent<any>): Promise<void> {
        logger.log(`[${conversation}]`, 'update', eventId);
        return this.storage.update(conversation, eventId);
    }

    public async removeMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'removeMembers', members);
        return this.storage.removeMembers(conversation, members);
    }

    public async addMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'addMembers', members);
        return this.storage.addMembers(conversation, members);
    }

    /**
     * Check if a given member is part of a conversation
     *
     * @param conversation
     * @param member
     */
    public async checkAccess(conversation: string, member: number) {
        logger.log(`[${conversation}]`, 'checkAccess', member);

        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return conversation.match(new RegExp(`${MEMBER_ENCLOSING}${member}${MEMBER_ENCLOSING}`, 'g'));
        }

        const conv = await this.storage.getConversation(conversation);
        return (conv.members || { values: [] as number[] }).values.find((m) => m === member) != null;
    }
}
