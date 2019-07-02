import { DataSource, DataSourceConfig } from "apollo-datasource";
import DataLoader from "dataloader";
import _ from "lodash";
import { TTLs } from "../cache/TTLs";
import { writeThrough } from "../cache/writeThrough";
import { filter } from "../privacy/filter";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

const cols = [
    "id",

    "pic",

    "firstname",
    "lastname",

    "association",
    "associationname",

    "area",
    "areaname",

    "club",
    "clubname",

    "roles"
];

export class MembersDataSource extends DataSource<IApolloContext> {
    context!: IApolloContext;
    memberLoader!: DataLoader<number, any>;
    rawLoader!: DataLoader<number, any>;
    columns: string = "*";

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.memberLoader = new DataLoader(
            (ids) => this.readCached(ids),
            {
                cacheKeyFn: (k: any) => parseInt(k, 10)
            }
        );

        this.rawLoader = new DataLoader(
            (ids) => this.rawReadMany(ids),
            {
                cacheKeyFn: (k: any) => parseInt(k, 10)
            }
        );
    }

    public async readFavorites(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await useDatabase(
            this.context,
            async (client) => {
                this.context.logger.log("executing readFavorites");

                const res = await client.query(`
select settings->'favorites' as favorites
from usersettings
where id = $1`, [this.context.principal.id]);

                if (res.rowCount == 0) return [];
                const favorites: number[] = res.rows[0]["favorites"];

                if (favorites == null || favorites.length === 0) return [];

                return this.memberLoader.loadMany(
                    favorites.filter(f => typeof (f) === "number" && !isNaN(f))
                );
            }
        );
    }

    public async readByTableAndAreas(areas: number[]): Promise<any[] | null> {
        this.context.logger.log("readAll");

        const results = await Promise.all(areas.map(a =>
            writeThrough(this.context,
                `Members::area_${this.context.principal.association}_${a}`,
                async () => await useDatabase(
                    this.context,
                    async (client) => {
                        this.context.logger.log("executing readByTableAndAreas");

                        const res = await client.query(`
    select ${cols.join(',')}
    from profiles
    where
            association = $1
        and area = ANY ($2::int[])
        and removed = FALSE`, [
                                areas,

                            ]);

                        return res.rows;
                    }
                ),
                TTLs.MemberOverview)
        ));

        return _(results).flatMap().value();

//         return await writeThrough(this.context,
//             `Members::readByTableAndAreas_${areas.join(',')}`,
//             async () => await useDatabase(
//                 this.context,
//                 async (client) => {
//                     this.context.logger.log("executing readByTableAndAreas");

//                     const res = await client.query(`
// select ${cols.join(',')}
// from profiles
// where
//         association = $1
//     and area = ANY ($2::int[])
//     and removed = FALSE`, [
//                             this.context.principal.association,
//                             areas,

//                         ]);

//                     return res.rows;
//                 }
//             ),
//             TTLs.MemberOverview);
    }

    public async readAll(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await writeThrough(this.context,
            "Members::readAll",
            async () => await useDatabase(
                this.context,
                async (client) => {
                    this.context.logger.log("executing readAll");

                    const res = await client.query(`
select ${cols.join(',')}
from profiles
where
    association = $1
and removed = FALSE`, [this.context.principal.association]);

                    return res.rows;
                }
            ),
            TTLs.MemberOverview);
    }

    public async readClub(association: string, club: number): Promise<any[] | null> {
        this.context.logger.log("readClub", association, club);

        const ids = await writeThrough(
            this.context,
            `Club_Members_${association}_${club}`,
            () => useDatabase(
                this.context,
                async (client) => {
                    const res = await client.query(`
select id
from profiles
where
        association = $1
    and club = $2
    and removed = FALSE
    and id in (
        select id from structure_tabler_roles
        where
            groupname = 'Members'
        and name = 'Member'
        and levelid = $3
        and isvalid = TRUE
    )`, [association, club, `${association}_${club}`]);

                    return res.rows.map(r => r["id"]) as number[];
                }
            ),
            TTLs.Structure,
        );

        return this.readMany(ids);
    }

    async readMany(ids: number[]): Promise<any[]> {
        this.context.logger.log("readMany", ids);
        return this.memberLoader.loadMany(ids);
    }

    public async readOne(id: number): Promise<any | null> {
        this.context.logger.log("readOne", id);
        return this.memberLoader.load(id);
    }

    async readCached(ids: number[]) {
        const keyValue = (id: number) => `Member_${id}`;

        const result = await this.context.cache.getMany(
            ids.map(id => keyValue(id)));

        // @ts-ignore
        const missing: number[] = ids
            .map(id => result[keyValue(id)] ? undefined : id)
            .filter(id => id != null);

        if (missing.length > 0) {
            const missingItems = await this.rawLoader.loadMany(missing);

            missingItems.forEach((v, i) => {
                result[keyValue(missing[i])] = JSON.stringify(v);
            });

            await this.context.cache.setMany(missingItems.map((_m, i) => ({
                id: keyValue(missing[i]),
                data: result[keyValue(missing[i])],
                options: {
                    ttl: TTLs.Member,
                }
            })));
        }

        return ids.map(id => filter(
            this.context.principal,
            JSON.parse(result[keyValue(id)])
        ));
    }

    async rawReadMany(ids: number[]): Promise<any[]> {
        this.context.logger.log("rawReadMany", ids);

        return useDatabase(
            this.context,
            async (client) => {
                const res = await client.query(`
select ${this.columns}
from profiles
where
        id = ANY($1)
    and removed = FALSE`, [ids]);

                return _(res.rows)
                    .sortBy(r => ids.indexOf(r["id"]))
                    .toArray()
                    .value();
            }
        );
    }
}