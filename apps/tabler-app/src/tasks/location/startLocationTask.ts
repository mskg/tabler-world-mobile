import * as Location from 'expo-location';
import { GeoParameters } from '../../helper/parameters/Geo';
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
            delete settings.pollInterval;
            delete settings.reverseGeocodeTimeout;
            logger.debug('settings', settings);

            const result = await updateLocation(true, true);

            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, settings);
            return result;
        } catch (e) {
            logger.error(e, `Start of ${LOCATION_TASK_NAME} failed`);
            return false;
        }
    }

    logger.log('*********** LOCATION SERVICES DISABLED');
    return false;
}
