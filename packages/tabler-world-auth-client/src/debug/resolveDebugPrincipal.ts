import { Environment } from '../Environment';
import { IPrincipal } from '../types/IPrincipal';

function envToJSON(val: string) {
    const replaced = val.replace(/'/g, '"');
    try {
        return JSON.parse(replaced);
    } catch (e) {
        throw new Error(`Could not parse '${replaced}`);
    }
}

export function resolveDebugPrincipal(authInfo: { [key: string]: string | undefined }): IPrincipal {
    const deviceId = authInfo['x-client-device'];
    let deviceConfig = null;

    // allow device specific configuration
    if (deviceId && Environment.DEBUG_DEVICES) {
        const devicesConfig = envToJSON(Environment.DEBUG_DEVICES);
        deviceConfig = devicesConfig[deviceId];

        if (deviceConfig != null) {
            console.warn('Using device config', deviceId);
            return deviceConfig;
        }
    }

    const debugUserEnv = Environment.DEBUG_USER;
    if (!deviceConfig && !debugUserEnv) {
        throw new Error('API_DEBUG_USER is not defined');
    }

    return deviceConfig || envToJSON(debugUserEnv as string);
}
