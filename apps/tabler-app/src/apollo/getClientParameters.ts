import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getClientParameters() {
    return {
        'x-client-name': Constants.manifest.name,
        'x-client-version': (Constants.isDevice ? Constants.manifest.version : 'dev') || 'dev',
        'x-client-device': Constants.deviceId || 'dev',
        'x-client-os': Platform.OS,
    };
}
