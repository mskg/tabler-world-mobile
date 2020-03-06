import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { cachedDataLoader, makeCacheKey } from '@mskg/tabler-world-cache';
import { IDataService, useDatabase } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { Conversation } from '../chat/Conversation';
import { UserConversation } from '../chat/UserConversation';
import { IApolloContext } from '../types/IApolloContext';
import { conversationManager } from '../websocketServer';

export async function isChatEnabled(client: IDataService, ids: ReadonlyArray<number>): Promise<boolean[]> {
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

    return ids.map((id) => res.rows.find((r) => r.id === id) != null || EXECUTING_OFFLINE);
}

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
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey('Member', ['chat', k]),
                // tslint:disable-next-line: variable-name
                (_r, id) => makeCacheKey('Member', ['chat', id]),
                (ids) => useDatabase(
                    this.context,
                    async (client) => isChatEnabled(client, ids),
                ),
                'ChatEnabled', // TODO: changeme
            ),
            {
                cacheKeyFn: (k: number) => k,
            },
        );
    }

    public async isMembersAvailableForChat(ids: number[]): Promise<boolean[]> {
        this.context.logger.debug('isMembersAvailableForChat', ids);
        return this.chatProperties.loadMany(ids);
    }

    public async isMemberAvailableForChat(id: number): Promise<boolean> {
        this.context.logger.debug('isMemberAvailableForChat', id);
        return this.chatProperties.load(id);
    }

    public async readConversation(id: string): Promise<Conversation | null> {
        this.context.logger.debug('readOne', id);

        // because queue/delivery runs in the same thread, using cached data would corrupt reality
        if (EXECUTING_OFFLINE) {
            return conversationManager.getConversation(id);
        }

        return this.conversations.load(id);
    }

    public async readUserConversation(id: string, member: number): Promise<UserConversation | null> {
        this.context.logger.debug('readOne', id);

        // because queue/delivery runs run in the same thread, using cached data would corrupt reality
        if (EXECUTING_OFFLINE) {
            return (await conversationManager.getUserConversation(id, member)) ?? null;
        }

        return this.userConversations.load({ id, member });
    }
}
