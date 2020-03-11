import { GeoParameters } from '@mskg/tabler-world-config-app';
import * as Location from 'expo-location';
import { AsyncStorage, Platform } from 'react-native';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { ParameterName } from '../../model/graphql/globalTypes';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from './logger';
import { updateLocation } from './updateLocation';

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

            const result = await updateLocation(true, true);

            await Location.startLocationUpdatesAsync(
                LOCATION_TASK_NAME,
                Platform.select({
                    ios: settings.ios,
                    android: __DEV__
                        ? {
                            ...settings.android,

                            // emulator only support high accuracy updates
                            accuracy: Location.Accuracy.High,
                        }
                        : settings.android,
                }),
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
