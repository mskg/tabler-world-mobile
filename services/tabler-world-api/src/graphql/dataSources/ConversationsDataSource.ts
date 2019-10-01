import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { conversationManager } from '../subscriptions';
import { Conversation, UserConversation } from '../subscriptions/services/ConversationManager';
import { IApolloContext } from '../types/IApolloContext';

export class ConversationsDataSource extends DataSource<IApolloContext> {
    public context!: IApolloContext;
    public conversations!: DataLoader<string, any>;
    public userConversations!: DataLoader<{ id: string, member: number }, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.conversations = new DataLoader<string, any>(
            (keys: string[]) => Promise.all(keys.map((k) => conversationManager.getConversation(k))),
            {
                cacheKeyFn: (k: string) => k,
            },
        );

        this.userConversations = new DataLoader<{ id: string, member: number }, any>(
            (keys: { id: string, member: number }[]) => Promise.all(keys.map((k) => conversationManager.getUserConversation(k.id, k.member))),
            {
                cacheKeyFn: (k: { id: string, member: number }) => `${k.id}:${k.member}`,
            },
        );
    }

    public async readConversation(id: string): Promise<Conversation | null> {
        this.context.logger.log('readOne', id);
        return this.conversations.load(id);
    }

    public async readUserConversation(id: string, member: number): Promise<UserConversation | null> {
        this.context.logger.log('readOne', id);
        return this.userConversations.load({ id, member });
    }
}
