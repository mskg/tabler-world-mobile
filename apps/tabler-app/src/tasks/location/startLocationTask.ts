import { GeoParameters } from '@mskg/tabler-world-config-app';
import * as Location from 'expo-location';
import { AsyncStorage, Platform } from 'react-native';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { I18N } from '../../i18n/translation';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getReduxStore } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from './logger';
import { updateLocation } from './updateLocation';

function exchangeTexts(options: any) {
    if (options.foregroundService) {
        options.foregroundService = {
            notificationTitle: I18N.Screen_NearbyMembers.title,
            notificationBody: I18N.Permissions.NSLocationAlwaysUsageDescription,
            // notificationColor: ___DexchangeTextsONT_USE_ME_DIRECTLY___COLOR_ACCENT,
        };
    }

    return options;
}

export async function startLocationTask(): Promise<boolean> {
    const enabled = await Location.hasServicesEnabledAsync();
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (enabled) {
        logger.debug('Always requesting permissions, as this might fail on android otherwise');
        await Location.requestPermissionsAsync();

        if (started) {
            logger.log(LOCATION_TASK_NAME, 'already started');
            return true;
        }

        try {
            logger.log('Starting task', LOCATION_TASK_NAME);

            const settings = await getParameterValue<GeoParameters>(ParameterName.geo);
            logger.debug('settings', settings);

            const foreground = getReduxStore().getState().settings.useForegroundService;
            const result = await updateLocation(true, true);

            await Location.startLocationUpdatesAsync(
                LOCATION_TASK_NAME,
                exchangeTexts(
                    Platform.select({
                        ios: settings.ios,
                        android: {
                            ...settings.android,

                            // when on, it's on
                            foregroundService: settings.android.foregroundService
                                ? settings.android.foregroundService
                                // user toggeled the switch
                                : foreground
                                    ? { // we just nneed to pass a value
                                        notificationBody: 'body',
                                        notificationTitle: 'title',
                                    }
                                    : undefined,

                            accuracy: __DEV__
                                ? Location.Accuracy.High
                                : settings.android.accuracy,
                        },
                    }),
                ),
            );

            await AsyncStorage.setItem(LOCATION_TASK_NAME, true.toString());

            return result;
        } catch (e) {
            logger.error('location-start', e);
            return false;
        }
    }

    logger.log('*********** LOCATION SERVICES DISABLED');
    return false;
}
