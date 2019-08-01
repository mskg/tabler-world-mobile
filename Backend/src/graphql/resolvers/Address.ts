import { addressHash } from "../../geo/addressHash";
import { IApolloContext } from "../types/IApolloContext";

function doTrim(s: string | undefined): string | null {
    if (s == null) return null;
    const r = s.trim();
    return r === "" ? null : r;
}

export const AddressResolver = {
    SocialMedia: {
        twitter: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.twitter);
        },

        linkedin: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.linkedin);
        },

        facebook: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.facebook);
        },

        instagram: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.instagram);
        },
    },

    Address: {
        street1: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.street1);
        },

        street2: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.street2);
        },

        city: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.city);
        },

        country: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.country);
        },

        postal_code: (root: any, _args: any, _context: IApolloContext) => {
            return doTrim(root.postal_code);
        },

        longitude: async (root: any, _args: any, context: IApolloContext) => {
            const hash = addressHash(root);
            context.logger.log(root, hash);

            if (hash == null) return null;

            const coordinates = await context.dataSources.geocoder.readOne(hash);
            return coordinates ? coordinates.longitude : null;
        },

        latitude: async (root: any, _args: any, context: IApolloContext) => {
            const hash = addressHash(root);
            if (hash == null) return null;

            const coordinates = await context.dataSources.geocoder.readOne(hash);
            return coordinates ? coordinates.latitude : null;
        },
    },
}