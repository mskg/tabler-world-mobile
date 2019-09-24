import Constants from 'expo-constants';
import { getConfigValue } from '../helper/getConfigValue';
import { getCurrentIdentity } from './getCurrentIdentity';
import { logger } from './logger';

export const fetchAuth = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    // throw "failed";
    const newOptions = {
        ...(options || {}),
        headers: {
            ...(options || {}).headers,
            'X-Client-Name': Constants.manifest.name,
            'X-Client-Version': Constants.manifest.version || 'dev',
            Authorization: await getCurrentIdentity(),
        },
    };

    if (__DEV__) {
        logger.debug('fetch', uri, newOptions);
    }

    // @ts-ignore options are compatible
    return await fetch(uri, newOptions);

};

export const fetchAuthDemo = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    const newOptions = {
        ...(options || {}),
        headers: {
            ...(options || {}).headers,
            'X-Client-Name': Constants.manifest.name,
            'X-Client-Version': Constants.manifest.version || 'dev',
            Authorization: `DEMO ${getConfigValue('apidemo')}`,
        },
    };

    if (__DEV__) {
        logger.debug('fetch', uri, newOptions);
    }

    // @ts-ignore options are compatible
    return await fetch(uri, newOptions);
};
