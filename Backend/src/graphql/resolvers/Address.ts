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
    },
}