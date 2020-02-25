import { cachedDataLoader, makeCacheKey } from '@mskg/tabler-world-cache';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { IApolloContext } from '../types/IApolloContext';

export class LocationDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private sharing!: DataLoader<number, any>;
    private map!: DataLoader<number, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.sharing = new DataLoader<number, any>(
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey('Member', ['location', k]),
                // tslint:disable-next-line: variable-name
                (_r, id) => makeCacheKey('Member', ['location', id]),
                (ids) => useDatabase(
                    this.context,
                    async (client) => {
                        const res = await client.query(
                            `
 select
    id
 from
    usersettings
 where
    id = ANY($1)
    and (settings->>'nearbymembers')::boolean = TRUE
 `,
                            [ids],
                        );

                        return ids.map((id) => res.rows.find((r) => r.id === id) != null);
                    },
                ),
                'LocationEnabled', // TODO: changeme
            ),
            {
                cacheKeyFn: (k: number) => k,
            },
        );

        this.map = new DataLoader<number, any>(
            (ids) => useDatabase(
                this.context,
                async (client) => {
                    const res = await client.query(
                        `
 select
    id
 from
    usersettings
 where
    id = ANY($1)
    and (settings->>'nearbymembersMap')::boolean = TRUE
 `,
                        [ids],
                    );

                    return ids.map((id) => res.rows.find((r) => r.id === id) != null);
                },
            ),
            {
                cacheKeyFn: (k: number) => k,
            },
        );
    }

    public async isMemberVisibleOnMap(id: number): Promise<boolean> {
        this.context.logger.log('isMemberVisibleOnMap', id);
        return this.map.load(id);
    }

    public async isMemberSharingLocation(id: number): Promise<boolean> {
        this.context.logger.log('isMemberSharingLocation', id);
        return this.sharing.load(id);
    }
}
