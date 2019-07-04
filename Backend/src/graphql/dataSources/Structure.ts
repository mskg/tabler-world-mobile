import { DataSource, DataSourceConfig } from "apollo-datasource";
import _ from "lodash";
import { makeCacheKey } from "../cache/makeCacheKey";
import { Mutex } from "../helper/Mutex";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";
import { ILogger } from "../types/ILogger";

enum RoleNames {
    President = 'President',
    VP = 'Vice-President',
    PP = 'Past-President',

    IRO = 'I.R.O.',
    Treasurer = 'Treasurer',

    PRO = 'P.R.O.',
    CSO = 'C.S.O.',
    WEB = 'Webmaster',

    IT = 'IT Admin',
    Editor = 'Editor',
    CDO = 'Corporate Design Officer',

    Secretary = 'Secretary',
    Shop = 'Shopkeeper',
}

const RoleOrderByMapping = {
    [RoleNames.President]: 1,
    [RoleNames.VP]: 2,
    [RoleNames.PP]: 3,

    [RoleNames.IRO]: 4,
    [RoleNames.Treasurer]: 5,

    [RoleNames.PRO]: 6,
    [RoleNames.CSO]: 7,
    [RoleNames.WEB]: 8,

    [RoleNames.IT]: 9,
    [RoleNames.Editor]: 10,
    [RoleNames.CDO]: 11,

    [RoleNames.Secretary]: 12,
    [RoleNames.Shop]: 13,
};

function sortRoles(roles?: any[]) {
    if (roles == null || roles.length === 0) return undefined;

    const sorted = _(roles)
        .sortBy(r => {
            const mapped = RoleOrderByMapping[r.role as RoleNames];
            return mapped || 99
        })
        .toArray()
        .value();

    return sorted;
}

export class StructureDataSource extends DataSource<IApolloContext> {
    context!: IApolloContext;
    logger!: ILogger;

    loadMutex = new Mutex();
    deserializeMutex = new Mutex();

    loaded: boolean = false;
    normalized: boolean = false;

    data: any;

    associations: { [key: string]: any } = {};
    areas: { [key: string]: any } = {};
    clubs: { [key: string]: any } = {};

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;
        this.logger = config.context.logger;
    }

    async load() {
        if (this.loaded) return;
        this.logger.log("Fetching structure data");

        const unlock = await this.loadMutex.lock();
        try {
            if (this.loaded) return;

            this.data = await useDatabase(
                this.context,
                async (client) => {
                    const res = await client.query("select structure from structure", []);
                    if (res.rowCount !== 1) {
                        throw new Error("Coud not load structure");
                    }

                    return res.rows[0]["structure"];
                }
            );

            this.loaded = true;
            this.logger.log("Fetching structure data -> done");
        }
        finally {
            unlock();
        }
    }

    public async rootData() {
        await this.load();
        return this.data;
    }

    public async allClubs() {
        await this.normalize();
        return _(this.clubs)
            .sortBy(c => c.club)
            .toArray()
            .value();
    }

    public async allAreas() {
        await this.normalize();
        return _(this.areas)
            .sortBy(c => c.area)
            .toArray()
            .value();
    }

    public async allAssociations() {
        await this.normalize();
        return _(this.associations)
            .sortBy(c => c.name)
            .toArray()
            .value();
    }

    async getAssociation(assoc: any) {
        await this.normalize();
        return this.associations[assoc];
    }

    async getArea(id: any) {
        await this.normalize();
        return this.areas[id];
    }

    async getClub(id: any) {
        await this.normalize();
        return this.clubs[id];
    }

    fillLocalData() {
        this.logger.log("Normalizing");

        this.data.forEach((subassoc: any) => {
            this.associations[subassoc.association] = {
                association: subassoc.association,
                name: subassoc.name,
                areas: (subassoc.areas || []).map((d: any) => subassoc.association + "_" + d.area),
                board: sortRoles(subassoc.board),
                boardassistants: sortRoles(subassoc.boardassistants),
            };

            (subassoc.areas || []).forEach((subarea: any) => {
                this.areas[subassoc.association + "_" + subarea.area] = {
                    id: subassoc.association + "_" + subarea.area,

                    association: subassoc.association,
                    area: subarea.area,
                    name: subarea.name,

                    // see below, duplicates
                    clubs: _(subarea.clubs).map(c => subassoc.association + "_" + c.club).uniq().toArray().value(),
                    board: sortRoles(subarea.board),
                };

                (subarea.clubs || []).forEach((subclub: any) => {
                    // there exist problems with the data resulting in
                    // i.Gr. tables beeing duplicated

                    const key = subassoc.association + "_" + subclub.club;
                    const existing = this.clubs[key];

                    if (existing != null) {
                        this.clubs[key] = {
                            ...existing,
                            // merge duplicated data
                            board: sortRoles([...(existing.board || []), ...(subclub.board || [])]),
                            boardassistants: sortRoles([...(existing.boardassistants || []), ...(subclub.boardassistants || [])]),
                        }
                    } else {
                        this.clubs[key] = {
                            id: key,

                            association: subassoc.association,
                            area: subarea.area,

                            club: subclub.club,
                            name: subclub.name,

                            board: sortRoles(subclub.board),
                            boardassistants: sortRoles(subclub.boardassistants),

                            ...subclub,
                        };
                    }
                });
            });
        });
    }

    async normalize() {
        if (this.normalized) return;

        const unlock = await this.deserializeMutex.lock();
        try {
            if (this.normalized) return;

            const key = makeCacheKey("Structure", ["all"]);

            const result = await this.context.cache.get(
                key
            );

            if (result) {
                const parsed = JSON.parse(result);

                this.associations = parsed.associations;
                this.areas = parsed.areas;
                this.clubs = parsed.clubs;
            } else {
                await this.load();
                this.fillLocalData();

                await this.context.cache.set(
                    key,
                    JSON.stringify({
                        associations: this.associations,
                        areas: this.areas,
                        clubs: this.clubs,
                    })
                );
            }

            this.normalized = true;
        }
        finally {
            unlock();
        }
    }
}