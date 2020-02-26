import { cachedDataLoader, makeCacheKey } from '@mskg/tabler-world-cache';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { getNearByParams } from '../helper/getNearByParams';
import { ILocationStorage, PutLocation, QueryResult } from '../location/ILocationStorage';
import { IApolloContext } from '../types/IApolloContext';

export class LocationDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private sharing!: DataLoader<number, any>;
    private map!: DataLoader<number, any>;

    public constructor(private storage: ILocationStorage) {
        super();
    }

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        if (this.storage.initialize) {
            this.storage.initialize(config);
        }

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

    public userLocation(): Promise<{ longitude: number, latitude: number } | undefined> {
        return this.storage.locationOf(this.context.principal.id);
    }

    public async query(): Promise<QueryResult> {
        const nearByQuery = await getNearByParams();

        return this.storage.query(
            this.context.principal.id,
            nearByQuery.radius,
            20,
            nearByQuery.days,
        );
    }

    public putLocation(loc: Pick<PutLocation, 'accuracy' | 'address' | 'latitude' | 'longitude' | 'speed'>): Promise<void> {
        return this.storage.putLocation({
            ...loc,
            member: this.context.principal.id,
            lastseen: new Date(),
        });
    }

    public isMemberVisibleOnMap(id: number): Promise<boolean> {
        this.context.logger.log('isMemberVisibleOnMap', id);
        return this.map.load(id);
    }

    public isMemberSharingLocation(id: number): Promise<boolean> {
        this.context.logger.log('isMemberSharingLocation', id);
        return this.sharing.load(id);
    }
}
