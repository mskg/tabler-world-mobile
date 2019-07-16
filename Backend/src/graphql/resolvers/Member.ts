import _ from "lodash";
import { IApolloContext } from "../types/IApolloContext";

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
        areas?: number[],

        nationalBoard?: Boolean,
        areaBoard?: Boolean,
    }
};

export const MemberResolver = {
    Member: {
        area: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                id: root.association + "_" + root.area,
                association: root.association,
                area: root.area,
                name: root.areaname,
            }
        },

        club: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                id: root.association + "_" + root.club,
                club: root.club, // needs to be added to allow subsent resolvers to work
                name: root.clubname,
                association: root.association,
                area: root.area,
            }
        },

        association: (root: any, _args: {}, _context: IApolloContext) => {
            return {
                name: root.associationname,
                association: root.association,
            }
        },
    },

    Query: {
        MembersOverview: async (_root: any, args: MemberFilter, context: IApolloContext) => {
            const result = [];

            // the optional filters only make sense if we don't retrieve all
            if (args.filter != null && args.filter.areas != null) {
                if (args.filter != null && args.filter.areas != null) {
                    context.logger.log("areas", args.filter.areas);
                    const areaMembers = await context.dataSources.members.readAreas(args.filter.areas);
                    result.push(... (areaMembers || []));
                }

                // we make this sync
                if (args.filter != null && args.filter.areaBoard === true) {
                    context.logger.log("areaBoard", args.filter);
                    const areas = await context.dataSources.structure.allAreas();

                    for (let area of areas) {
                        if (area.board) {
                            const board = await context.dataSources.members.readMany(
                                area.board.map((b: any) => b.member));

                            if (board) {
                                result.push(...board);
                            }
                        }
                    }
                }

                if (args.filter != null && args.filter.nationalBoard === true) {
                    context.logger.log("nationalBoard", args.filter);
                    const associations = await context.dataSources.structure.allAssociations();

                    for (let assoc of associations) {
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

                if (result.length > 0) {
                    context.logger.log("result", result.length, "entries");
                    return _.uniqBy(result, (m) => m.id);
                }
            }

            return context.dataSources.members.readAll();
        },

        FavoriteMembers: async (_root: any, _args: MemberFilter, context: IApolloContext) => {
            return context.dataSources.members.readFavorites();
        },

        OwnTable: async (_root: any, _args: MemberFilter, context: IApolloContext) => {
            return context.dataSources.members.readClub(context.principal.association, context.principal.club);
        },

        Members: (_root: any, args: IdsArgs, context: IApolloContext) => {
            return context.dataSources.members.readMany(args.ids);
        },

        Member: (_root: any, args: IdArgs, context: IApolloContext) => {
            return context.dataSources.members.readOne(args.id);
        },
    }
}