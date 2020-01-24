import _ from 'lodash';
import { byVersion, v12Check } from '../helper/byVersion';
import { IApolloContext } from '../types/IApolloContext';

// type MembersArgs = {
//     state?: string,
//     cursor?: string,
//     limit?: number,
// };

type IdArgs = {
    id: number,
};

type IdsArgs = {
    ids: number[],
};

type MemberFilter = {
    filter: {
        // deprectated
        areas?: number[],

        nationalBoard?: boolean,
        areaBoard?: boolean,
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const MemberResolver = {
    Member: {
        area: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                id: root.area,
                association: root.association,
                name: root.areaname,
                shortname: root.areashortname,
            };
        },

        club: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                id: root.club,
                // -- DEPRECATED --
                club: root.clubnumber,
                clubnumber: root.clubnumber,
                name: root.clubname,
                shortname: root.clubshortname,
                association: root.association,
                area: root.area,
            };
        },

        association: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                name: root.associationname,
                id: root.association,
                shortname: root.associationshortname,
            };
        },
    },

    // compatibility
    RoleRef: {
        name: (root: any, _args: any, context: IApolloContext) => {
            return byVersion({
                context,
                mapVersion: v12Check,

                versions: {
                    old: () => root.shortname,
                    default: () => root.name,
                },
            });
        },
    },

    Company: {
        sector: (root: any, _args: {}, _context: IApolloContext) => {
            return root.sector ? root.sector.replace(/-/ig, '') : null;
        },
    },

    Query: {
        MembersOverview: async (_root: any, args: MemberFilter, context: IApolloContext) => {
            const result = [];

            // the optional filters only make sense if we don't retrieve all
            if (args.filter != null && (args.filter.areas != null || args.filter.areaBoard != null || args.filter.nationalBoard != null)) {
                if (args.filter.areas != null && args.filter.areas.length > 0) {
                    context.logger.log('areas', args.filter.areas);
                    const areaMembers = await context.dataSources.members.readAreas(args.filter.areas.map((a) => `de_d${a}`));
                    result.push(... (areaMembers || []));
                }

                // we make this sync
                if (args.filter.areaBoard === true) {
                    context.logger.log('areaBoard', args.filter);
                    const areas = await context.dataSources.structure.allAreas(context.principal.association);

                    for (const area of areas) {
                        if (area.board) {
                            const board = await context.dataSources.members.readMany(
                                area.board.map((b: any) => b.member));

                            if (board) {
                                result.push(...board);
                            }
                        }
                    }
                }

                if (args.filter.nationalBoard === true) {
                    context.logger.log('nationalBoard', args.filter);
                    const associations = [await context.dataSources.structure.getAssociation(context.principal.association)];

                    for (const assoc of associations) {
                        if (assoc.board) {
                            const board = await context.dataSources.members.readMany(assoc.board.map((b: any) => b.member));
                            if (board) {
                                result.push(...board);
                            }
                        }

                        if (assoc.boardassistants) {
                            const boardassistants = await context.dataSources.members.readMany(assoc.boardassistants.map((b: any) => b.member));
                            if (boardassistants) {
                                result.push(...boardassistants);
                            }
                        }
                    }
                }

                return result.length > 0 ? _.uniqBy(result, (m) => m.id) : [];
            }

            return context.dataSources.members.readAll(context.principal.association);
        },

        FavoriteMembers: async (_root: any, _args: MemberFilter, context: IApolloContext) => {
            const favorites = await context.dataSources.members.readFavorites();

            if (favorites) {
                // there could be favorites that no longer exist
                return favorites.filter((f) => f != null);
            }

            return favorites || [];
        },

        OwnTable: async (_root: any, _args: MemberFilter, context: IApolloContext) => {
            const members = await context.dataSources.members.readClub(context.principal.club);
            return members || [];
        },

        Members: (_root: any, args: IdsArgs, context: IApolloContext) => {
            if (args.ids == null || args.ids.length === 0) { return []; }
            return context.dataSources.members.readMany(args.ids);
        },

        Member: (_root: any, args: IdArgs, context: IApolloContext) => {
            return context.dataSources.members.readOne(args.id);
        },
    },
};
