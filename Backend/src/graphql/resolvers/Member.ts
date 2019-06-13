import { IApolloContext } from "../types/IApolloContext";
import { getMemberReader } from "./helper";
import { MemberReader } from "./MemberReader";

type MembersArgs = {
    state?: string,
    cursor?: string,
    limit?: number,
}

type IdArgs = {
    id: number,
}

type IdsArgs = {
    ids: number[],
}

export const MemberResolver = {
    Member: {
        area: (root: any, _args: IdArgs, _context: IApolloContext) => {
            return {
                id: root.association + "_" + root.area,
                association: root.association,
                area: root.area,
                name: root.areaname,
            }
        },

        club: (root: any, _args: IdArgs, _context: IApolloContext) => {
            return {
                id: root.association + "_" + root.club,
                club: root.club, // needs to be added to allow subsent resolvers to work
                name: root.clubname,
                association: root.association,
                area: root.area,
            }
        },

        association: (root: any, _args: IdArgs, _context: IApolloContext) => {
            return {
                name: root.associationname,
                association: root.association,
            }
        },
    },

    Query: {
        MembersOverview: async (_root: any, _args: MembersArgs, context: IApolloContext) => {
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

            return new MemberReader(context, cols.join(",")).readAll();
        },

        Members: (_root: any, args: IdsArgs, context: IApolloContext) => {
            return getMemberReader(context).readMany(args.ids);
        },

        Member: (_root: any, args: IdArgs, context: IApolloContext) => {
            return getMemberReader(context).readOne(args.id);
        },
    }
}