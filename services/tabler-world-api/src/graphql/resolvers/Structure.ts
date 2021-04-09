import { addressHash, enrichAddress } from '@mskg/tabler-world-geo';
import * as DateParser from 'date-and-time';
import { filter, sortBy } from 'lodash';
import { byVersion, v12Check } from '../helper/byVersion';
import { removeFamily } from '../helper/removeFamily';
import { IApolloContext } from '../types/IApolloContext';

type ById = {
    id: string,
};

type ByAssociation = {
    association?: string,
};

type ByFamily = {
    family?: string,
};


function getSortKey(shortname: string) {
    const nbrs = shortname.replace(/[^0-9]/ig, '');
    if (nbrs != null) {
        return parseInt(nbrs, 10);
    }

    return shortname;
}

type Role = {
    role: string,
    member: number,
};

/**
 * We lookup all members as they have to be loaded anyway
 *
 * @param context
 * @param roles
 */
async function ensureActiveMember(context: IApolloContext, roles?: Role[]) {
    if (!roles) { return []; }

    const result = await Promise.all(roles.map(async (r) => {
        return {
            ...r,
            // returns null if the user is no longer valid
            member: await context.dataSources.members.readOne(r.member),
        };
    }));

    return result.filter((r) => r.member);
}

// tslint:disable: export-name
// tslint:disable: variable-name
export const StructureResolver = {
    Query: {
        Families: (_root: any, _args: any, context: IApolloContext) => {
            context.logger.debug('Families');
            return context.dataSources.structure.allFamilies();
        },

        Family: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.debug('Family', args);
            return context.dataSources.structure.getFamily(args.id || context.principal.family as string);
        },

        Associations: async (_root: any, args: ByFamily, context: IApolloContext) => {
            context.logger.debug('Associations');

            return byVersion({
                context,
                mapVersion: v12Check,

                versions: {
                    old: async () => [await context.dataSources.structure.getAssociation(context.principal.association)],
                    default: () => context.dataSources.structure.allAssociations(args.family || context.principal.family!),
                },
            });
        },

        Association: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.debug('Association', args);
            return context.dataSources.structure.getAssociation(args.id || context.principal.association);
        },

        Clubs: (_root: any, args: ByAssociation, context: IApolloContext) => {
            context.logger.debug('Clubs', args);
            return context.dataSources.structure.allClubs(args.association || context.principal.association);
        },


        Club: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.debug('Club', args);
            return context.dataSources.structure.getClub(args.id);
        },

        Areas: async (_root: any, args: ByAssociation, context: IApolloContext) => {
            context.logger.debug('Areas', args);
            const areas = await context.dataSources.structure.allAreas(args.association || context.principal.association);

            // there is areas without clubs, which doesn't really make sense
            return filter(
                sortBy(
                    areas,
                    (a) => getSortKey(a.shortname),
                ),
                (a) => (a.clubs && a.clubs.length > 0) || (a.board && a.board.length > 0),
            );
        },

        Area: (_root: any, args: ById, context: IApolloContext) => {
            context.logger.debug('Area', args);
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
            if (root.areas) {
                return Promise.all(
                    root.areas.map(async (r: any) =>
                        await context.dataSources.structure.getArea(r)),
                );
            }

            return context.dataSources.structure.allAreas(root.association);
        },

        board: (root: any, _args: any, context: IApolloContext) => {
            return ensureActiveMember(context, root.board);
        },

        boardassistants: (root: any, _args: any, context: IApolloContext) => {
            return ensureActiveMember(context, root.boardassistants);
        },

        isocode: (root: any) => {
            return removeFamily(root.id).toUpperCase();
        },
    },

    Club: {
        // -- DEPRECATED --
        club: (root: any, _args: any, _context: IApolloContext) => {
            return root.clubnumber;
        },

        meetingplace1: async (root: any, _args: any, _context: IApolloContext) => {
            const address = root.meetingplace1;
            if (address != null) {
                return enrichAddress(
                    address,
                    removeFamily(root.association),
                );
            }

            return null;
        },

        meetingplace2: async (root: any, _args: any, _context: IApolloContext) => {
            const address = root.meetingplace2;
            if (address != null) {
                return enrichAddress(
                    address,
                    removeFamily(root.association),
                );
            }

            return null;
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
            // context.logger.debug(root, hash);

            const coordinates = await context.dataSources.geocoder.readOne(hash);
            // context.logger.debug(root, hash, coordinates);

            return coordinates && coordinates.latitude
                ? {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                }
                : null;
        },

        area: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.debug("C.Area Loading", root);
            return context.dataSources.structure.getArea(
                root.area,
            );
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            // context.logger.debug("C.Association Loading", root);
            return context.dataSources.structure.getAssociation(
                root.association,
            );
        },

        family: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.getFamily(
                root.family,
            );
        },

        members: async (root: any, _args: any, context: IApolloContext) => {
            const data = await context.dataSources.members.readClub(root.id);

            // can be null due to read access
            return filter(
                data,
                (e) => e != null,
            );
        },

        board: (root: any, _args: any, context: IApolloContext) => {
            return ensureActiveMember(context, root.board);
        },

        boardassistants: (root: any, _args: any, context: IApolloContext) => {
            return ensureActiveMember(context, root.boardassistants);
        },
    },

    ClubInfo: {
        charter_date: (root: any, _args: any, context: IApolloContext) => {
            if (!root.charter_date) { return null; }

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
            return typeof root.member === 'number'
                ? context.dataSources.members.readOne(root.member)
                // already loaded
                : root.member;
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
            const area = await context.dataSources.structure.getArea(root.id);
            return (area.clubs || []).map((r: any) => context.dataSources.structure.getClub(r));
        },

        association: (root: any, _args: any, context: IApolloContext) => {
            return context.dataSources.structure.getAssociation(root.association);
        },

        board: (root: any, _args: any, context: IApolloContext) => {
            return ensureActiveMember(context, root.board);
        },
    },
};
