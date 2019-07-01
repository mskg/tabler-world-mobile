import Auth from "@aws-amplify/auth";
import { setContext } from "apollo-link-context";
import Constants from 'expo-constants';
import { logoutUser } from "../redux/actions/user";
import { getReduxStore } from "../redux/getRedux";
import { logger } from "./logger";

export const fetchAuth = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    // throw "failed";

    try {
        const session = await Auth.currentSession();
        const cred = await Auth.currentCredentials();

        const token = session.getIdToken().getJwtToken();

        // logger.debug(session.getRefreshToken());
        logger.debug("Expiration", new Date(session.getIdToken().getExpiration() * 1000));

        const newOptions = {
            ...(options || {}),
            headers: {
                ...(options || {}).headers,
                "X-Client-Name": Constants.name,
                "X-Client-Version": Constants.manifest.version || "dev",
                Authorization: token,
            }
        }

        logger.debug("fetch", uri, newOptions);
        return await fetch(uri, newOptions);
    }
    catch (e) {
        logger.error(e, "Failed to acquire token");

        if (e.code === "ResourceNotFoundException") {
            getReduxStore().dispatch(logoutUser());
            return new Response(null);
        }

        if (e === "No current user") {
            getReduxStore().dispatch(logoutUser());
            return new Response(null);
        }

        return Promise.reject(e);
    }
};

export const authLink = setContext(async (_, { headers }) => {
    // throw "failed";

    try {
        logger.debug("Aquire token");

        const session = await Auth.currentSession();
        const cred = await Auth.currentCredentials();
        const token = session.getIdToken().getJwtToken();

        // logger.debug(session.getRefreshToken());
        logger.debug("Expiration", new Date(session.getIdToken().getExpiration() * 1000));

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