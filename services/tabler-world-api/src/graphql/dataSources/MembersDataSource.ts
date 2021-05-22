import { cachedDataLoader, cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { flatMap, uniq, uniqBy } from 'lodash';
import { filter } from '../privacy/filter';
import { filterFormerMember } from '../privacy/filterFormerMember';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable-next-line: variable-name
export const DefaultMemberColumns = [
    'id',

    'pic',

    'firstname',
    'lastname',

    'family',

    'association',
    // 'associationshortname',
    // 'associationname',
    // 'associationflag',

    'area',
    // 'areaname',
    // 'areashortname',

    'club',
    // 'clubnumber',
    // 'clubname',
    // 'clubshortname',

    'roles',
];

export class MembersDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private memberLoader!: DataLoader<number, any>;
    private anyMemberLoader!: DataLoader<number, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.memberLoader = new DataLoader<number, any>(
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey('Member', [k]),
                (r) => makeCacheKey('Member', [r.id]),
                (ids) => useDatabase(
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

        this.anyMemberLoader = new DataLoader<number, any>(
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey('Member', [k]),
                (r) => makeCacheKey('Member', [r.id]),
                (ids) => useDatabase(
                    this.context,
                    async (client) => {
                        this.context.logger.log('DB reading members', ids);

                        const res = await client.query(
                            `
select *
from profiles
where
    id = ANY($1)
`,
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

    public async readFavorites(includeClubs?: boolean): Promise<any[] | null> {
        this.context.logger.log('readFavorites', includeClubs);

        return await useDatabase(
            this.context,
            async (client) => {
                this.context.logger.debug('executing readFavorites');

                const res = await client.query(
                    `
select settings->'favorites' as favorites, settings->'favoriteClubs' as favoriteclubs
from usersettings
where id = $1`,
                    [this.context.principal.id],
                );

                if (res.rowCount === 0) { return []; }

                const favorites: number[] = res.rows[0].favorites || [];
                const favoriteClubs: string[] = res.rows[0].favoriteclubs || [];

                this.context.logger.debug('favorites', favorites, 'favoriteclubs', favoriteClubs);
                const result = [];

                if (favorites.length > 0) {
                    result.push(
                        ... await this.memberLoader.loadMany(
                            favorites.filter((f) => typeof (f) === 'number' && !isNaN(f)),
                        ));
                }

                if (includeClubs && favoriteClubs.length > 0) {
                    result.push(
                        ... await this.readClubs(favoriteClubs),
                    );
                }

                return uniqBy(result, (r: any) => r?.id).filter((m) => m != null).map((member: any) => {
                    return filter(
                        this.context.principal,
                        member,
                    );
                });
            },
        );
    }

    public async readAreas(areas: string[]): Promise<any[] | null> {
        this.context.logger.log('readAreas', areas);

        // only overview columns here, no need to filter
        const results = await Promise.all(areas.map((a) =>
            cachedLoad(
                this.context,
                makeCacheKey('Members', [this.context.principal.association, 'area', a]),
                async () => await useDatabase(
                    this.context,
                    async (client) => {
                        this.context.logger.debug('executing readByTableAndAreas');

                        const res = await client.query(
                            `
select ${DefaultMemberColumns.join(',')}
from profiles
where
        area = $1
    and removed = FALSE`,
                            [a],
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
        this.context.logger.log('readAll', association);

        // only overview columns here, no need to filter
        return await cachedLoad(
            this.context,
            makeCacheKey('Members', [this.context.principal.association, 'all']),
            async () => await useDatabase(
                this.context,
                async (client) => {
                    this.context.logger.debug('executing readAll');

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

    public async readClubs(clubs: string[]): Promise<any[]> {
        this.context.logger.debug('readClubs', clubs);

        const cbs = await Promise.all(clubs.map((c) => this.context.dataSources.structure.getClub(c)));
        const members = cbs.map((c) => c?.members).flat().filter((m) => m != null);

        return members?.length > 0 ? this.readMany(uniq(members)) : [];
    }

    public async readClub(club: string): Promise<any[]> {
        this.context.logger.debug('readClub', club);
        const clubDetails = await this.context.dataSources.structure.getClub(club);
        return clubDetails ? this.readMany(clubDetails.members) : [];
    }

    public async readOneManyWithAnyStatus(id: number): Promise<any | null> {
        this.context.logger.debug('readOne', id);

        const member = await this.anyMemberLoader.load(id);
        if (member == null) { return member; }

        if (member.removed) {
            return filterFormerMember(
                member,
            );
        }

        return filter(
            this.context.principal,
            member,
        );
    }

    public async readManyWithAnyStatus(ids: number[]): Promise<any[]> {
        if (ids == null || ids.length === 0) return [];

        this.context.logger.debug('readMany', ids);
        return (await this.anyMemberLoader.loadMany(ids)).map((member: any) => {
            if (member == null) { return member; }

            if (member.removed) {
                return filterFormerMember(
                    member,
                );
            }

            return filter(
                this.context.principal,
                member,
            );
        });
    }

    public async readMany(ids: number[]): Promise<any[]> {
        if (ids == null || ids.length === 0) return [];

        this.context.logger.debug('readMany', ids);
        return (await this.memberLoader.loadMany(ids)).map((member: any) => {
            if (member == null) { return member; }

            return filter(
                this.context.principal,
                member,
            );
        });
    }

    public async readOne(id: number): Promise<any | null> {
        this.context.logger.debug('readOne', id);

        const member = await this.memberLoader.load(id);
        if (member == null) { return member; }

        return filter(
            this.context.principal,
            member,
        );
    }
}
