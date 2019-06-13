import DataLoader from "dataloader";
import _ from "lodash";
import { filter } from "../privacy/filter";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

export class MemberReader {
    memberLoader: DataLoader<number, any>;

    constructor(private context: IApolloContext, private columns: string = "*") {
        this.memberLoader = new DataLoader(
            (ids) => this.rawReadMany(ids),
            {
                cacheKeyFn: (k: any) => parseInt(k, 10)
            }
        );
    }

    public async readAll(): Promise<any[] | null> {
        this.context.logger.log("readAll");

        return useDatabase(
            this.context.logger,
            async (client) => {
                const filterContext = await this.context.filterContext(client);

                const res = await client.query(`
select ${this.columns}
from profiles
where
    removed = FALSE`, []);

                if (res.rows.length == 0) {
                    return null
                }

                return res.rows.map(
                    r => filter(filterContext, r)
                );
            }
        );
    }

    public async readClub(association: string, club: number): Promise<any[] | null> {
        this.context.logger.log("readClub", association, club);

        return useDatabase(
            this.context.logger,
            async (client) => {
                const filterContext = await this.context.filterContext(client);

                const res = await client.query(`
select ${this.columns}
from profiles
where
        association = $1
    and club = $2
    and removed = FALSE`, [association, club]);

                if (res.rows.length == 0) {
                    return null
                }

                const filtered = res.rows.map(
                    r => filter(filterContext, r)
                );

                filtered.forEach(r =>
                    this.memberLoader.prime(r["id"], r)
                );

                return filtered;
            }
        );
    }

    async readMany(ids: number[]): Promise<any[]> {
        this.context.logger.log("readMany", ids);
        return this.memberLoader.loadMany(ids);
    }

    public async readOne(id: number): Promise<any | null> {
        this.context.logger.log("readOne", id);
        return this.memberLoader.load(id);
    }

    async rawReadMany(ids: number[]): Promise<any[]> {
        this.context.logger.log("rawReadMany", ids);

        return useDatabase(
            this.context.logger,
            async (client) => {
                const filterContext = await this.context.filterContext(client);

                const res = await client.query(`
select ${this.columns}
from profiles
where
        id = ANY($1)
    and removed = FALSE`, [ids]);

                // original order must be preserved
                return _(res.rows)
                    .map(r => filter(filterContext, r))
                    .sortBy(r => ids.indexOf(r["id"]))
                    .toArray()
                    .value();
            }
        );
    }
}