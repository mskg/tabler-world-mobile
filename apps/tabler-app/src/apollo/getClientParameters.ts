import Constants from 'expo-constants';

export function getClientParameters() {
    return {
        'x-client-name': Constants.manifest.name,
        'x-client-version': Constants.manifest.version || 'dev',
        'x-client-device': Constants.deviceId || 'dev',
    };
}
