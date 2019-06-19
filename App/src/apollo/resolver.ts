import { LastSyncResolver } from "../helper/cache/LastSyncResolver";

const lastUpdate = () => {
    return Date.now();
};

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