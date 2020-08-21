import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Key =
    | 'region'
    | 'identityPoolId'
    | 'userPoolId'
    | 'userPoolWebClientId'
    | 'api'
    | 'wsapi'
    | 'apidemo'
    | 'sentry'
    | 'cognitoAnalytics'
    | 'amplitudeAnalytics'
    | 'appLanguages'
    ;

type ConfigTypes = string | string[] | {
    [key: string]: string,
};

const TEST_EXTERNAL = false;

export function getConfigValue<T extends ConfigTypes = string>(key: Key): T {
    if (!TEST_EXTERNAL && key === 'api' && __DEV__ && !Constants.isDevice) {
        if (Platform.OS === 'android') {
            // default redirect to localhost for android emulator
            // tslint:disable-next-line: no-http-string
            return 'http://10.0.2.2:3000' as T;
        } if (Platform.OS === 'ios') {
            return 'http://localhost:3000' as T;
        }
    }

    if (!TEST_EXTERNAL && key === 'wsapi' && __DEV__ && !Constants.isDevice) {
        if (Platform.OS === 'android') {
            // default redirect to localhost for android emulator
            // tslint:disable-next-line: no-http-string
            return 'ws://10.0.2.2:3001/' as T;
        }

        if (Platform.OS === 'ios') {
            return 'ws://localhost:3001/' as T;
        }
    }

    return Constants.manifest.extra[key];
}
