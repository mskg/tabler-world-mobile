import * as DateParser from 'date-and-time';
import { IApolloContext } from "../types/IApolloContext";

type ById = {
    id: string,
};

export const StructureResolver = {
    Query: {
        Associations: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Associations");
            return context.dataSources.structure.allAssociations();
        },

        Clubs: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Clubs");
            return context.dataSources.structure.allClubs();
        },

        Areas: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log("Areas");
            return context.dataSources.structure.allAreas();
        },

        Club: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log("Club", args.id);
            return context.dataSources.structure.getClub(args.id);
        },
    },

    Association: {
        areas: async (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log(root);

            const mgr = await context.dataSources.structure;
            return root.areas.map((r: any) => mgr.getArea(r));
        },
    },

    Club: {
        id: (root: any, _args: any, _context: IApolloContext) => {
            return root.association + "_" + root.club;
        },

        area: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Area Loading", root);
            return context.dataSources.structure.getArea(
                root.association + "_" + root.area
            )
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Association Loading", root);
            return context.dataSources.structure.getAssociation(root.association);
        },

        members: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.members.readClub(
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
            return context.dataSources.members.readOne(root.member);
        },
    },

    Area: {
        id: (root: any, _args: any, _context: IApolloContext) => {
            return root.association + "_" + root.area;
        },

        clubs: async (root: any, _args: any, context: IApolloContext) => {
            const mgr = await context.dataSources.structure;
            if (root.clubs) return root.clubs.map((r: any) => mgr.getClub(r));

            // we're coming from member!
            const area = await mgr.getArea(root.association + "_" + root.area);
            return area.clubs.map((r: any) => mgr.getClub(r));
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.getAssociation(root.association);
        },
    }
}