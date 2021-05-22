import { Family } from '@mskg/tabler-world-auth-client';
import { AuditAction } from '@mskg/tabler-world-common';
import _ from 'lodash';
import { byVersion, v12Check } from '../helper/byVersion';
import { fixC41AssociationName } from '../helper/fixC41AssociationName';
import { SECTOR_MAPPING } from '../helper/Sectors';
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
        byArea?: string[],
        // clubs?: string[],

        nationalBoard?: boolean,
        areaBoard?: boolean,
    },
};

type FavoritesFilter = {
    filter?: {
        includeClubs?: boolean,
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const MemberResolver = {
    // this is not correct but removes a lot of load
    // we know which fields are selected from the client
    // needs to be changed probably
    Member: {
        id: ({ id }: any, _args: any, context: IApolloContext) => {
            context.auditor.add({ id, action: AuditAction.Read, type: 'member' });
            return id;
        },

        area: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.structure.getArea(root.area);
        },

        club: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.structure.getClub(root.club);
        },

        association: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.structure.getAssociation(root.association);
        },

        family: (root: any, _args: {}, context: IApolloContext) => {
            return context.dataSources.structure.getFamily(root.family);
        },

        // only deliver it, if it contains usable data
        address: (root: any, _args: {}, _context: IApolloContext) => {
            const { address } = root;

            if (address?.city || address?.postal_code || address?.street1 || address?.street2) {
                return root.address;
            }

            return null;
        },
    },

    // compatibility
    RoleRef: {
        name: (root: any, _args: any, context: IApolloContext) => {
            const originalName = byVersion({
                context,
                mapVersion: v12Check,

                versions: {
                    old: () => root.shortname,
                    default: () => root.name,
                },
            });

            return fixC41AssociationName(originalName);
        },
    },

    Company: {
        sector: (root: any, _args: {}, _context: IApolloContext) => {
            if (!root.sector) return null;

            const id = root.sector.replace(/-/ig, '');
            if (SECTOR_MAPPING[id]) { return id; }

            return null;
        },

        address: (root: any, _args: {}, _context: IApolloContext) => {
            return root.address && Object.keys(root.address).length > 0 ? root.address : null;
        },
    },

    Education: {
        address: (root: any, _args: {}, _context: IApolloContext) => {
            return root.address && Object.keys(root.address).length > 0 ? root.address : null;
        },
    },

    Query: {
        MembersOverview: async (_root: any, args: MemberFilter, context: IApolloContext) => {
            const result = [];

            // the optional filters only make sense if we don't retrieve all
            if (args.filter != null && (args.filter.areas != null || args.filter.byArea != null || args.filter.areaBoard != null || args.filter.nationalBoard != null)) {
                if (args.filter.areas != null && args.filter.areas.length > 0) {
                    context.logger.debug('areas', args.filter.areas);
                    const areaMembers = await context.dataSources.members.readAreas(args.filter.areas.map((a) => `${Family.RTI}_de_d${a}`));
                    result.push(... (areaMembers || []));
                }

                if (args.filter.byArea != null && args.filter.byArea.length > 0) {
                    context.logger.debug('byArea', args.filter.byArea);
                    const areaMembers = await context.dataSources.members.readAreas(args.filter.byArea);
                    result.push(... (areaMembers || []));
                }

                // we make this sync
                if (args.filter.areaBoard === true) {
                    context.logger.debug('areaBoard', args.filter);
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
                    context.logger.debug('nationalBoard', args.filter);
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

                // need to filter null results
                return result.length > 0 ? _.uniqBy(result.filter((f) => f), (m) => m.id) : [];
            }

            return context.dataSources.members.readAll(context.principal.association);
        },

        FavoriteMembers: async (_root: any, args: FavoritesFilter, context: IApolloContext) => {
            const favorites = await context.dataSources.members.readFavorites(
                args?.filter?.includeClubs === true,
            );

            return favorites
                ? favorites.filter((f) => f != null)
                : [];
        },

        OwnTable: async (_root: any, _args: MemberFilter, context: IApolloContext) => {
            const members = await context.dataSources.members.readClub(context.principal.club);
            return members ? members.filter((f) => f != null) : [];
        },

        Members: async (_root: any, args: IdsArgs, context: IApolloContext) => {
            if (args.ids == null || args.ids.length === 0) { return []; }

            const members = await context.dataSources.members.readMany(args.ids);
            return members ? members.filter((f) => f != null) : [];
        },

        Member: (_root: any, args: IdArgs, context: IApolloContext) => {
            return context.dataSources.members.readOne(args.id);
        },
    },
};
