import { DataSource, DataSourceConfig } from "apollo-datasource";
import DataLoader from "dataloader";
import _ from "lodash";
import { cachedDataLoader } from "../../shared/cache/cachedDataLoader";
import { makeCacheKey } from "../../shared/cache/makeCacheKey";
import { writeThrough } from "../../shared/cache/writeThrough";
import { useDataService } from "../../shared/rds/useDataService";
import { filter } from "../privacy/filter";
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

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.memberLoader = new DataLoader<number, any>(
            cachedDataLoader<number>(
                this.context,
                (k) => makeCacheKey("Member", [k]),
                (r) => makeCacheKey("Member", [r["id"]]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log("DB reading members", ids);

                        const res = await client.query(`
    select *
    from profiles
    where
        id = ANY($1)
    and removed = FALSE
    `, [ids]);

                        return res.rows;
                    }
                ),
                "Member",
            ),
            {
                cacheKeyFn: (k: number) => k,
            }
        );
    }

    public async readFavorites(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await useDataService(
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

    public async readAreas(areas: number[]): Promise<any[] | null> {
        this.context.logger.log("readAll");

        const results = await Promise.all(areas.map(a =>
            writeThrough(this.context,
                makeCacheKey("Members", [this.context.principal.association, "area", a]),
                async () => await useDataService(
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
                                this.context.principal.association,
                                areas,
                            ]);

                        return res.rows;
                    }
                ),
                "MemberOverview")
        ));

        return _(results).flatMap().value();
    }

    public async readAll(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return await writeThrough(this.context,
            makeCacheKey("Members", [this.context.principal.association, "all"]),
            async () => await useDataService(
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
            "MemberOverview");
    }

    public async readClub(association: string, club: number): Promise<any[] | null> {
        this.context.logger.log("readClub", association, club);
        const clubDetails = await this.context.dataSources.structure.getClub(association + "_" + club);

        return this.readMany(clubDetails.members);
    }

    async readMany(ids: number[]): Promise<any[]> {
        this.context.logger.log("readMany", ids);
        return (await this.memberLoader.loadMany(ids)).map((member: any) => {
            if (member == null) return member;

            return filter(
                this.context.principal,
                member,
            )
        });
    }

    public async readOne(id: number): Promise<any | null> {
        this.context.logger.log("readOne", id);

        const member = await this.memberLoader.load(id);
        if (member == null) return member;

        return filter(
            this.context.principal,
            member,
        );
    }
}