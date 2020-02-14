import { IPrincipal } from '../types/IPrincipal';

function envToJSON(val: string) {
    const replaced = val.replace(/'/g, '"');
    try {
        return JSON.parse(replaced);
    } catch (e) {
        throw new Error(`Could not parse '${replaced}`);
    }
}

export function resolveDebugPrincipal(authInfo: { [key: string]: string }): IPrincipal {
    const deviceId = authInfo['x-client-device'];
    let deviceConfig = null;

    // allow device specific configuration
    if (deviceId && process.env.API_DEBUG_DEVICES) {
        const devicesConfig = envToJSON(process.env.API_DEBUG_DEVICES);
        deviceConfig = devicesConfig[deviceId];

        if (deviceConfig != null) {
            console.warn('Using device config', deviceId);
            return deviceConfig;
        }
    }

    const debugUserEnv = process.env.API_DEBUG_USER;
    if (!deviceConfig && !debugUserEnv) {
        throw new Error('API_DEBUG_USER is not defined');
    }

    return deviceConfig || envToJSON(debugUserEnv as string);
}
