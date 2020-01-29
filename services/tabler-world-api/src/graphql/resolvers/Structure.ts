import { addressHash, enrichAddress } from '@mskg/tabler-world-geo';
import * as DateParser from 'date-and-time';
import { sortBy } from 'lodash';
import { byVersion, v12Check } from '../helper/byVersion';
import { removeFamily } from '../helper/removeFamily';
import { IApolloContext } from '../types/IApolloContext';

type ById = {
    id: string,
};

type ByAssociation = {
    association: string,
};

function getSortKey(shortname: string) {
    const nbrs = shortname.replace(/[^0-9]/ig, '');
    if (nbrs != null) {
        return parseInt(nbrs, 10);
    }

    return shortname;
}

// tslint:disable: export-name
// tslint:disable: variable-name
export const StructureResolver = {
    Query: {
        Families: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log('Families');
            return context.dataSources.structure.allFamilies();
        },

        Family: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log('Family', args);
            return context.dataSources.structure.getFamily(args.id || context.principal.family as string);
        },

        Associations: async (_root: any, _args: any, context: IApolloContext) => {
            context.logger.log('Associations');

            return byVersion({
                context,
                mapVersion: v12Check,

                versions: {
                    old: async () => [await context.dataSources.structure.getAssociation(context.principal.association)],
                    default: () => context.dataSources.structure.allAssociations(),
                },
            });
        },

        Association: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log('Association', args);
            return context.dataSources.structure.getAssociation(args.id || context.principal.association);
        },

        Clubs: (_root: any, args: ByAssociation, context: IApolloContext) => {
            context.logger.log('Clubs', args);
            return context.dataSources.structure.allClubs(args.association || context.principal.association);
        },

        Club: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log('Club', args);
            return context.dataSources.structure.getClub(args.id);
        },

        Areas: async (_root: any, args: ByAssociation, context: IApolloContext) => {
            context.logger.log('Areas', args);
            const areas = await context.dataSources.structure.allAreas(args.association || context.principal.association);
            return sortBy(areas, (a) => getSortKey(a.shortname));
        },

        Area: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.log('Area', args);
            return context.dataSources.structure.getArea(args.id);
        },
    },

    Association: {
        family: (root: any, _args: any, _context: IApolloContext) => {
            return { id: root.family };
        },

        // deprecated fixture, replaced by id
        association: (root: any, _args: any, _context: IApolloContext) => {
            return root.id;
        },

        areas: async (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.allAreas(root.association);
        },

        board: (root: any, _args: any, _context: IApolloContext) => {
            return root.board || [];
        },

        boardassistants: (root: any, _args: any, _context: IApolloContext) => {
            return root.boardassistants || [];
        },
    },

    Club: {
        // -- DEPRECATED --
        club: (root: any, _args: any, _context: IApolloContext) => {
            return root.clubnumber;
        },

        location: async (root: any, _args: any, context: IApolloContext) => {
            // currently there is no country in that address
            let address = root.meetingplace1 || root.meetingplace2;
            if (address != null) {
                address = enrichAddress(
                    address,
                    removeFamily(root.association),
                );
            }

            const hash = addressHash(address);
            if (hash == null) { return null; }
            // context.logger.log(root, hash);

            const coordinates = await context.dataSources.geocoder.readOne(hash);
            // context.logger.log(root, hash, coordinates);

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
                root.area,
            );
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Association Loading", root);
            return context.dataSources.structure.getAssociation(
                root.association,
            );
        },

        family: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.log("C.Association Loading", root);
            return context.dataSources.structure.getFamily(
                root.family,
            );
        },

        members: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.members.readClub(
                root.id,
            );
        },

        board: (root: any, _args: any, _context: IApolloContext) => {
            return root.board || [];
        },
    },

    ClubInfo: {
        charter_date: (root: any, _args: any, context: IApolloContext) => {
            try {
                const date = DateParser.parse(root.charter_date, 'DD/MM/YYYY');
                return new Date(date).toISOString();
            } catch (e) {
                context.logger.error(e, 'Could not parse', root.charter_date);
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
        // -- DEPRECATED --
        area: (_root: any, _args: any, _context: IApolloContext) => {
            return 0;
        },

        clubs: async (root: any, _args: any, context: IApolloContext) => {
            // console.log(root);

            if (root.clubs) {
                return Promise.all(
                    root.clubs.map(async (r: any) =>
                        await context.dataSources.structure.getClub(r)),
                );
            }

            // we're coming from member!
            const area = await context.dataSources.structure.getArea(root.area);
            return area.clubs.map((r: any) => context.dataSources.structure.getClub(r));
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.getAssociation(root.association);
        },

        board: (root: any, _args: any, _context: IApolloContext) => {
            return root.board || [];
        },
    },
};
