import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getClientParameters(): {[key: string]: string} {
    return {
        'x-client-name': Constants.manifest.name as string,
        'x-client-version': (Constants.isDevice ? Constants.manifest.version : 'dev') || 'dev',
        'x-client-device': Constants.installationId || 'dev',
        'x-client-os': Platform.OS,
    };
}
