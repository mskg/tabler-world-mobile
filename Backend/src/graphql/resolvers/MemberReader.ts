import DataLoader from "dataloader";
import _ from "lodash";
import { TTLs } from "../cache/TTLs";
import { writeThrough } from "../cache/writeThrough";
import { filter } from "../privacy/filter";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

export class MemberReader {
    memberLoader: DataLoader<number, any>;
    rawLoader: DataLoader<number, any>;

    constructor(private context: IApolloContext, private columns: string = "*") {
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
                    favorites.filter(f => typeof(f) === "number" && !isNaN(f))
                );
            }
        );
    }

    public async readByTableAndAreas(areas?: number[]): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await useDatabase(
            this.context,
            async (client) => {
                this.context.logger.log("executing readByTableAndAreas");

                const res = await client.query(`
select ${this.columns}
from profiles
where
        association = $1
    and area = ANY ($2::int[])
    and removed = FALSE`, [
                        this.context.principal.association,
                        areas,

                    ]);

                return res.rows;
            }
        );
    }

    public async readAll(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await useDatabase(
            this.context,
            async (client) => {
                this.context.logger.log("executing readAll");

                const res = await client.query(`
select ${this.columns}
from profiles
where
    association = $1
and removed = FALSE`, [this.context.principal.association]);

                return res.rows;
            }
        );
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

    readCached(ids: number[]) {
        return Promise.all(
            ids.map((id) =>
                writeThrough(
                    this.context,
                    `Member_${id}`,
                    async () => {
                        // this optimizes to read all if one is missing
                        // they normally only come in a pack
                        await this.rawLoader.loadMany(ids);
                        return await this.rawLoader.load(id);
                    },
                    TTLs.Member,
                )
            )
        ).then((members) => {
            return members.map(member => filter(this.context.principal, member));
        })
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