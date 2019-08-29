import { cachedDataLoader, makeCacheKey, writeThrough } from "@mskg/tabler-world-cache";
import { ILogger } from "@mskg/tabler-world-common";
import { useDataService } from "@mskg/tabler-world-rds-client";
import { DataSource, DataSourceConfig } from "apollo-datasource";
import DataLoader from "dataloader";
import { IApolloContext } from "../types/IApolloContext";

// enum RoleNames {
//     President = 'President',
//     VP = 'Vice-President',
//     PP = 'Past-President',

//     IRO = 'I.R.O.',
//     Treasurer = 'Treasurer',

//     PRO = 'P.R.O.',
//     CSO = 'C.S.O.',
//     WEB = 'Webmaster',

//     IT = 'IT Admin',
//     Editor = 'Editor',
//     CDO = 'Corporate Design Officer',

//     Secretary = 'Secretary',
//     Shop = 'Shopkeeper',
// }

// const RoleOrderByMapping = {
//     [RoleNames.President]: 1,
//     [RoleNames.VP]: 2,
//     [RoleNames.PP]: 3,

//     [RoleNames.IRO]: 4,
//     [RoleNames.Treasurer]: 5,

//     [RoleNames.PRO]: 6,
//     [RoleNames.CSO]: 7,
//     [RoleNames.WEB]: 8,

//     [RoleNames.IT]: 9,
//     [RoleNames.Editor]: 10,
//     [RoleNames.CDO]: 11,

//     [RoleNames.Secretary]: 12,
//     [RoleNames.Shop]: 13,
// };

// function sortRoles(roles?: any[]) {
//     if (roles == null || roles.length === 0) return undefined;

//     const sorted = _(roles)
//         .sortBy(r => {
//             const mapped = RoleOrderByMapping[r.role as RoleNames];
//             return mapped || 99
//         })
//         .toArray()
//         .value();

//     return sorted;
// }

type AssocKey = {
    association: string,
    id: number,
};

export class StructureDataSource extends DataSource<IApolloContext> {
    context!: IApolloContext;
    logger!: ILogger;

    associationLoader!: DataLoader<string, any>;
    clubLoader!: DataLoader<AssocKey, any>;
    areaLoader!: DataLoader<AssocKey, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;
        this.logger = config.context.logger;

        this.associationLoader = new DataLoader<string, any>(
            cachedDataLoader<string>(
                this.context,
                (k) => makeCacheKey("Association", [k]),
                (r) => makeCacheKey("Association", [r["association"]]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log("DB reading associations", ids);

                        const res = await client.query(`
    select *
    from structure_associations
    where
        association = ANY($1)
    `, [ids]);

                        return res.rows;
                    }
                ),
                "Structure",
            ),
            {
                cacheKeyFn: (k: string) => k
            }
        );

        this.areaLoader = new DataLoader<AssocKey, any>(
            cachedDataLoader<AssocKey>(
                this.context,
                (k) => makeCacheKey("Area", [k.association, k.id]),
                (r) => makeCacheKey("Area", [r["association"], r["area"]]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log("DB reading areas", ids);

                        const res = await client.query(`
    select *
    from structure_areas
    where
        association = $1
    and area = ANY($2)
    `, [ids[0].association, ids.map(i => i.id)]);

                        return res.rows;
                    }
                ),
                "Structure",
            ),
            {
                cacheKeyFn: (k: AssocKey) => k.association + "_" + k.id,
            }
        );

        this.clubLoader = new DataLoader<AssocKey, any>(
            cachedDataLoader<AssocKey>(
                this.context,
                // we use the same format for the key that can be extracted during read
                (k) => makeCacheKey("Club", [k.association + "_" + k.id]),
                (r) => makeCacheKey("Club", [r["id"]]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log("DB reading clubs", ids);

                        const res = await client.query(`
    select *
    from structure_clubs
    where
        association = $1
    and club = ANY($2)
    `, [ids[0].association, ids.map(i => i.id)]);

                        return res.rows;
                    }
                ),
                "Structure",
            ),
            {
                cacheKeyFn: (k: AssocKey) => k.association + "_" + k.id
            }
        );
    }

    public async allClubs() {
        return await writeThrough(
            this.context,
            makeCacheKey("Structure", [this.context.principal.association, "clubs", "all"]),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log("DB reading allClubs");

                    const res = await client.query(`
select *
from structure_clubs
where
    association = $1
`, [this.context.principal.association]);

                    return res.rows;
                }
            ),
            "StructureOverview"
        );
    }

    public async allAreas(assoc?: string) {
        return await writeThrough(
            this.context,
            makeCacheKey("Structure", [assoc || this.context.principal.association, "areas", "all"]),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log("DB reading allAreas");

                    const res = await client.query(`
select *
from structure_areas
where
    association = $1
`, [assoc || this.context.principal.association]);

                    return res.rows;
                }
            ),
            "StructureOverview"
        );
    }

    /**
     * Currently this limits the result to only the current organization of the user
     */
    public async allAssociations() {
        return [await this.getAssociation(this.context.principal.association)];
    }

    async getAssociation(assoc: any) {
        return this.associationLoader.load(assoc);
    }

    async getArea(assoc: string, id: any) {
        return this.areaLoader.load({ association: assoc, id });
    }

    async getClub(id: string) {
        const ids = id.split("_");
        return this.clubLoader.load({ association: ids[0], id: parseInt(ids[1], 10) });
    }
}