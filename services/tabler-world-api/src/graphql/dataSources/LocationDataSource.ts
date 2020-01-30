import { useDataService } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { IApolloContext } from '../types/IApolloContext';

export class LocationDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private settings!: DataLoader<number, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.settings = new DataLoader<number, any>(
            (ids: ReadonlyArray<number>) => useDataService(this.context, async (client) => {
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
            }),
            {
                cacheKeyFn: (k: number) => k,
            },
        );
    }

    public async isMemberSharingLocation(id: number): Promise<boolean> {
        this.context.logger.log('isMemberSharingLocation', id);
        return this.settings.load(id);
    }
}
