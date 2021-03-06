import { ConsoleLogger } from '@mskg/tabler-world-common';
import { PaggedResponse, QueryOptions } from '@mskg/tabler-world-lambda-subscriptions';
import { ALL_CHANNEL_PREFIX, ALL_CHANNEL_SUFFIX, DIRECT_CHAT_PREFIX, DIRECT_CHAT_SUFFIX, MEMBER_ENCLOSING, MEMBER_SEPERATOR } from '../Constants';
import { Conversation } from '../types/Conversation';
import { IConversationStorage } from '../types/IConversationStorage';
import { UserConversation } from '../types/UserConversation';

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

    public getConversations(member: number, options: QueryOptions = { pageSize: 10 }): Promise<PaggedResponse<string>> {
        logger.debug('getConversations', member);
        return this.storage.getConversations(member, options);
    }

    public getConversation(conversation: string): Promise<Conversation> {
        logger.debug(`[${conversation}]`, 'get');
        return this.storage.getConversation(conversation);
    }

    public getUserConversation(conversation: string, member: number): Promise<UserConversation | undefined> {
        logger.debug(`[${conversation}]`, 'getUserConversation', member);
        return this.storage.getUserConversation(conversation, member);
    }

    /**
     * Updates the lastseen timestamp for a given conversation and memmber.
     *
     * @param conversation
     * @param member
     * @param lastSeen
     */
    public updateLastSeen(conversation: string, member: number, lastSeen: string) {
        logger.log(`[${conversation}]`, 'updateLastSeen', member, lastSeen);
        return this.storage.updateLastSeen(conversation, member, lastSeen);
    }

    /**
     * Updates conversation information with latest update
     *
     * @param conversation
     * @param param1
     */
    public update(conversation: string, eventId: string): Promise<void> {
        logger.log(`[${conversation}]`, 'update', eventId);
        return this.storage.update(conversation, eventId);
    }

    public removeMembers(conversation: string, members: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'removeMembers', members);
        return this.storage.removeMembers(conversation, members);
    }

    public addMembers(conversation: string, members: number[]): Promise<void> {
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
        logger.debug(`[${conversation}]`, 'checkAccess', member);

        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return conversation.match(new RegExp(`${MEMBER_ENCLOSING}${member}${MEMBER_ENCLOSING}`, 'g'));
        }

        const conv = await this.storage.getConversation(conversation);
        return (conv.members || { values: [] as number[] }).values.find((m) => m === member) != null;
    }
}
