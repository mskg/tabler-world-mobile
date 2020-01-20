import { useDataService } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { conversationManager } from '../subscriptions';
import { Conversation, UserConversation } from '../subscriptions/services/ConversationManager';
import { IApolloContext } from '../types/IApolloContext';

export class ConversationsDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private conversations!: DataLoader<string, any>;
    private userConversations!: DataLoader<{ id: string, member: number }, any>;
    private chatProperties!: DataLoader<number, any>;


    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.conversations = new DataLoader<string, any>(
            (keys: ReadonlyArray<string>) => Promise.all(keys.map((k) => conversationManager.getConversation(k))),
            {
                cacheKeyFn: (k: string) => k,
            },
        );

        this.userConversations = new DataLoader<{ id: string, member: number }, any, string>(
            (keys: ReadonlyArray<{ id: string, member: number }>) => Promise.all(keys.map((k) => conversationManager.getUserConversation(k.id, k.member))),
            {
                cacheKeyFn: (k: { id: string, member: number }) => `${k.id}:${k.member}`,
            },
        );

        this.chatProperties = new DataLoader<number, any>(
            (ids: ReadonlyArray<number>) => useDataService(this.context, async (client) => {
                const res = await client.query(
                    `
 select
    id
 from
    usersettings
 where
        id = ANY($1)
    and (
            settings->'notifications'->>'personalChat' is null
        or  settings->'notifications'->>'personalChat' = 'true'
    )
    and array_length(tokens, 1) > 0
 `,
                    [ids],
                );

                return ids.map((id) => res.rows.find((r) => r.id === id) != null);
            }),
            {
                cacheKeyFn: (k: number) => k,
            },
        );
    }

    public async isMemberAvailableForChat(id: number): Promise<boolean> {
        this.context.logger.log('isMemberAvailableForChat', id);
        return this.chatProperties.load(id);
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
