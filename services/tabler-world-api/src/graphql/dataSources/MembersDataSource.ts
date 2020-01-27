import { cachedDataLoader, makeCacheKey, writeThrough } from '@mskg/tabler-world-cache';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { flatMap } from 'lodash';
import { filter } from '../privacy/filter';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable-next-line: variable-name
export const DefaultMemberColumns = [
    'id',

    'pic',

    'firstname',
    'lastname',

    'association',
    'associationshortname',
    'associationname',
    'associationflag',

    'area',
    'areaname',
    'areashortname',

    'club',
    'clubnumber',
    'clubname',
    'clubshortname',

    'roles',
];

export class MembersDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;
    private memberLoader!: DataLoader<number, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.memberLoader = new DataLoader<number, any>(
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey('Member', [k]),
                (r) => makeCacheKey('Member', [r.id]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log('DB reading members', ids);

                        const res = await client.query(
                            `
select *
from profiles
where
    id = ANY($1)
and removed = FALSE`,
                            [ids],
                        );

                        return res.rows;
                    },
                ),
                'Member',
            ),
            {
                cacheKeyFn: (k: number) => k,
            },
        );
    }

    public async readFavorites(): Promise<any[] | null> {
        this.context.logger.log('readAll');

        return await useDataService(
            this.context,
            async (client) => {
                this.context.logger.log('executing readFavorites');

                const res = await client.query(
                    `
select settings->'favorites' as favorites
from usersettings
where id = $1`,
                    [this.context.principal.id],
                );

                if (res.rowCount === 0) { return []; }
                const favorites: number[] = res.rows[0].favorites;

                if (favorites == null || favorites.length === 0) { return []; }

                const result = await this.memberLoader.loadMany(
                    favorites.filter((f) => typeof (f) === 'number' && !isNaN(f)),
                );

                return result.map((member: any) => {
                    if (member == null) { return member; }

                    return filter(
                        this.context.principal,
                        member,
                    );
                });
            },
        );
    }

    public async readAreas(areas: string[]): Promise<any[] | null> {
        this.context.logger.log('readAll');

        // only overview columns here, no need to filter
        const results = await Promise.all(areas.map((a) =>
            writeThrough(
                this.context,
                makeCacheKey('Members', [this.context.principal.association, 'area', a]),
                async () => await useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log('executing readByTableAndAreas');

                        const res = await client.query(
                            `
select ${DefaultMemberColumns.join(',')}
from profiles
where
        area = ANY ($1)
    and removed = FALSE`,
                            [areas],
                        );

                        return res.rows;
                    },
                ),
                'MemberOverview',
            ),
        ));

        return flatMap(results);
    }

    public async readAll(association: string): Promise<any[] | null> {
        this.context.logger.log('readAll');

        // only overview columns here, no need to filter
        return await writeThrough(
            this.context,
            makeCacheKey('Members', [this.context.principal.association, 'all']),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log('executing readAll');

                    const res = await client.query(
                        `
select ${DefaultMemberColumns.join(',')}
from profiles
where
    association = $1
and removed = FALSE`,
                        [association],
                    );

                    return res.rows;
                },
            ),

            'MemberOverview',
        );
    }

    public async readClub(club: string): Promise<any[] | null> {
        this.context.logger.log('readClub', club);
        const clubDetails = await this.context.dataSources.structure.getClub(club);

        return this.readMany(clubDetails.members);
    }

    public async readMany(ids: number[]): Promise<any[]> {
        if (ids == null || ids.length === 0) return [];

        this.context.logger.log('readMany', ids);
        return (await this.memberLoader.loadMany(ids)).map((member: any) => {
            if (member == null) { return member; }

            return filter(
                this.context.principal,
                member,
            );
        });
    }

    public async readOne(id: number): Promise<any | null> {
        this.context.logger.log('readOne', id);

        const member = await this.memberLoader.load(id);
        if (member == null) { return member; }

        return filter(
            this.context.principal,
            member,
        );
    }
}
