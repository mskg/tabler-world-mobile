import gql from 'graphql-tag';
import { LastSyncResolver } from "../helper/cache/LastSyncResolver";

const lastUpdate = () => {
    return Date.now();
};

/**
 * Support for apollo codegen
 */
export const typeDefs = gql`
    type GlobalSyncState {
        clubs: Int!
        members: Int!
        areas: Int!
        associations: Int!
        utility: Int!
    }

    extend type Query {
        LastSync: GlobalSyncState!
    }
    extend type Member {
        LastSync: Int!
    }
    extend type Club {
        LastSync: Int!
    }
`;

export const Resolvers = {
    Query: {
        LastSync: LastSyncResolver,
    },

    Member: {
        LastSync: lastUpdate
    },

    Club: {
        LastSync: lastUpdate
    }
};