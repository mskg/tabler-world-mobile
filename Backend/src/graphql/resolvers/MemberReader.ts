import DataLoader from "dataloader";
import _ from "lodash";
import { TTLs } from "../cache/TTLs";
import { writeThrough } from "../cache/writeThrough";
import { filter } from "../privacy/filter";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

// const gzipPromise = (input: any) => {
//     const promise = new Promise(function (resolve, reject) {
//         gzip(input, { level: 9 }, function (error, result) {
//             if (!error) resolve(result);
//             else reject(error);
//         });
//     });

//     return promise;
// };

// const ungzipPromise = (input: any) => {
//     const promise = new Promise(function (resolve, reject) {
//         unzip(input, function (error, result) {
//             if (!error) resolve(result);
//             else reject(error);
//         });
//     });

//     return promise;
// };

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
removed = FALSE`, []);

                return res.rows;
            }
        );

    //     try {
    //         // try {
    //         const zipped = await writeThrough(
    //             this.context,
    //             "MembersOverview",
    //             async () =>
    //                 await gzipPromise(
    //                     JSON.stringify(
    //                         await useDatabase(
    //                             this.context,
    //                             async (client) => {
    //                                 this.context.logger.log("executing readAll");

    //                                 const res = await client.query(`
    // select ${this.columns}
    // from profiles
    // where
    //     removed = FALSE`, []);

    //                                 return res.rows;
    //                             }
    //                         ))),
    //             TTLs.MemberOverview);

    //         return await JSON.parse(
    //             await ungzipPromise(zipped) as string);
    //     } catch (e) {
    //         this.context.logger.error(e);

    //         this.context.cache.delete("MembersOverview");
    //         // return this.readAll();
    //         return [];
    //     }
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
            )
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
        const filterContext = await this.context.filterContext();

        return Promise.all(
            ids.map(async (id) =>
                filter(
                    filterContext,
                    await writeThrough(
                        this.context,
                        `Member_${id}`,
                        () => this.rawLoader.load(id),
                        TTLs.Member,
                    ))
            )
        )
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