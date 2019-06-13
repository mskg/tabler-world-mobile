import Auth from "@aws-amplify/auth";
import { setContext } from "apollo-link-context";
import { logoutUser } from "../redux/actions/user";
import { getReduxStore } from "../redux/getRedux";
import { logger } from "./logger";

export const authLink = setContext(async (_, { headers }) => {
    try {
        logger.debug("Aquire token");

        const session = await Auth.currentSession();
        const cred = await Auth.currentCredentials();
        const token = session.getIdToken().getJwtToken();

        // logger.debug(session.getRefreshToken());
        logger.debug("Expiration", new Date(session.getIdToken().getExpiration()* 1000));

        return {
            headers: {
                ...headers,
                Authorization: token,
            }
        }
    }
    catch (e) {
        logger.error(e, "Failed to acquire token");

        if (e.code === "ResourceNotFoundException") {
            getReduxStore().dispatch(logoutUser());
            return;
        }

        if (e === "No current user") {
            getReduxStore().dispatch(logoutUser());
            return;
        }

        throw e;
    }
});