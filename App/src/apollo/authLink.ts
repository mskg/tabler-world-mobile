import Auth from '@aws-amplify/auth';
import Constants from 'expo-constants';
import { getConfigValue } from '../helper/Configuration';
import { logoutUser } from '../redux/actions/user';
import { getReduxStore } from '../redux/getRedux';
import { isAuthenticationError } from './isAuthenticationError';
import { logger } from './logger';

export const fetchAuth = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    // throw "failed";

    try {
        const session = await Auth.currentSession();
        await Auth.currentCredentials();

        const token = session.getIdToken().getJwtToken();

        // logger.debug(session.getRefreshToken());
        logger.debug('Expiration', new Date(session.getIdToken().getExpiration() * 1000));

        const newOptions = {
            ...(options || {}),
            headers: {
                ...(options || {}).headers,
                'X-Client-Name': Constants.manifest.name,
                'X-Client-Version': Constants.manifest.version || 'dev',
                Authorization: token,
            },
        };

        if (__DEV__) {
            logger.debug('fetch', uri, newOptions);
        }

        // @ts-ignore options are compatible
        return await fetch(uri, newOptions);
    } catch (e) {
        if (isAuthenticationError(e)) {
            logger.log('Failed to acquire token', e);
            getReduxStore().dispatch(logoutUser());
        }

        return Promise.reject(e);
    }
};

export const fetchAuthDemo = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    const newOptions = {
        ...(options || {}),
        headers: {
            ...(options || {}).headers,
            'X-Client-Name': Constants.manifest.name,
            'X-Client-Version': Constants.manifest.version || 'dev',
            Authorization: 'DEMO ' + getConfigValue('apidemo'),
        },
    };

    if (__DEV__) {
        logger.debug('fetch', uri, newOptions);
    }

    // @ts-ignore options are compatible
    return await fetch(uri, newOptions);
};
