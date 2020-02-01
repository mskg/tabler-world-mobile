import { getConfigValue } from '../helper/getConfigValue';
import { getClientParameters } from './getClientParameters';
import { getCurrentIdentity } from './getCurrentIdentity';
import { logger } from './logger';

export const fetchAuth = async (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
    // throw "failed";
    const newOptions = {
        ...(options || {}),
        headers: {
            ...(options || {}).headers,
            ...getClientParameters(),
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
            ...getClientParameters(),
            Authorization: `DEMO ${getConfigValue('apidemo')}`,
        },
    };

    if (__DEV__) {
        logger.debug('fetch', uri, newOptions);
    }

    // @ts-ignore options are compatible
    return await fetch(uri, newOptions);
};
