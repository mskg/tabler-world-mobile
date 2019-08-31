import { addressHash } from "@mskg/tabler-world-geo";
import * as DateParser from "date-and-time";
import { IApolloContext } from "../types/IApolloContext";

type ById = {
    id: string,
};

// tslint:disable: export-name
// tslint:disable: variable-name
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
            return context.dataSources.structure.allAreas(root.association);
        },
    },

    Club: {
        location: async (root: any, _args: any, context: IApolloContext) => {
            const hash = addressHash(root.meetingplace1);
            context.logger.log(root, hash);

            if (hash == null) { return null; }

            const coordinates = await context.dataSources.geocoder.readOne(hash);
            context.logger.log(root, hash, coordinates);

            return coordinates && coordinates.latitude
                ? {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                }
                : null;
        },

        area: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Area Loading", root);
            return context.dataSources.structure.getArea(
                root.association, root.area,
            );
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Association Loading", root);
            return context.dataSources.structure.getAssociation(
                root.association);
        },

        members: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.members.readClub(
                root.association, root.club,
            );
        },
    },

    ClubInfo: {
        charter_date: (root: any, _args: any, context: IApolloContext) => {
            try {
                const date = DateParser.parse(root.charter_date, "DD/MM/YYYY");
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
        // id: (root: any, _args: any, _context: IApolloContext) => {
        //     return root.association + "_" + root.area;
        // },

        clubs: async (root: any, _args: any, context: IApolloContext) => {
            console.log(root);

            if (root.clubs) {
                return Promise.all(
                    root.clubs.map(async (r: any) =>
                        await context.dataSources.structure.getClub(r)),
                );
            }

            // we're coming from member!
            const area = await context.dataSources.structure.getArea(root.association, root.area);
            return area.clubs.map((r: any) => context.dataSources.structure.getClub(r));
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.getAssociation(root.association);
        },
    },
};
