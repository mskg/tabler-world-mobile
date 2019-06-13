import * as DateParser from 'date-and-time';
import { IApolloContext } from "../types/IApolloContext";
import { getMemberReader, getStructureReader } from "./helper";

type ById = {
    id: string,
};

export const StructureResolver = {
    Query: {
        Associations: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Associations");
            return getStructureReader(context).allAssociations();
        },

        Clubs: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Clubs");
            return getStructureReader(context).allClubs();
        },

        Areas: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Areas");
            return getStructureReader(context).allAreas();
        },

        Club: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log("Club", args.id);
            return getStructureReader(context).getClub(args.id);
        },
    },

    Association: {
        areas: async (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log(root);

            const mgr = await getStructureReader(context);
            return root.areas.map((r: any) => mgr.getArea(r));
        },
    },

    Club: {
        id: (root: any, _args: any, _context: IApolloContext) => {
            return root.association + "_" + root.club;
        },

        area: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Area Loading", root);
            return getStructureReader(context).getArea(
                root.association + "_" + root.area
            )
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Association Loading", root);
            return getStructureReader(context).getAssociation(root.association);
        },

        members: (root: any, _args: any, context: IApolloContext) => {
            return getMemberReader(context).readClub(
                root.association, root.club
            );
        },
    },

    ClubInfo: {
        charter_date: (root: any, _args: any, context: IApolloContext) => {
            try {
                const date = DateParser.parse(root.charter_date, 'DD/MM/YYYY');
                return new Date(date).toISOString();
            } catch (e) {
                context.logger.error(e, "Could not parse", root.charter_date);
                return null;
            }
        },
    },

    AssociationRole: {
        member: (root: any, _args: any, context: IApolloContext) => {
            return getMemberReader(context).readOne(root.member);
        },
    },

    Area: {
        id: (root: any, _args: any, _context: IApolloContext) => {
            return root.association + "_" + root.area;
        },

        clubs: async (root: any, _args: any, context: IApolloContext) => {
            const mgr = await getStructureReader(context);
            if (root.clubs) return root.clubs.map((r: any) => mgr.getClub(r));

            // we're coming from member!
            const area = await mgr.getArea(root.association + "_" + root.area);
            return area.clubs.map((r: any) => mgr.getClub(r));
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            return getStructureReader(context).getAssociation(root.association);
        },
    }
}