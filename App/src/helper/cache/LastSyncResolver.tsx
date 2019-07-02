import { logger } from "./logger";

export const LastSyncResolver = () => {
    logger.log("Updated LastSync");
    return {
        __typename: 'LastSync',
        clubs: Date.now(),
        members: Date.now(),
        areas: Date.now(),
        associations: Date.now(),
        utility: Date.now(),
        albums: Date.now(),
    };
};
