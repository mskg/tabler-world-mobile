import * as Location from 'expo-location';
import { AsyncStorage } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { getReduxPersistor, persistorRehydrated } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from '../fetch/logger';
import { isSignedIn } from '../helper/isSignedIn';
import { handleLocationUpdate } from './handleLocationUpdate';
import { isLocationTaskEnabled } from './isLocationTaskEnabled';

export async function runLocationTask({ data, error }) {
    try {
        logger.debug('runLocationTask');
        if (!(await isLocationTaskEnabled())) {
            return;
        }

        Audit.trackEvent(AuditEventName.LocationUpdate);

        if (error) {
            logger.error(error, `Received error runLocationUpdate`);
            return;
        }

        const locations: Location.LocationData[] = (data as any)?.locations;
        if (locations) {
            await persistorRehydrated();

            // we only run in demo mode or if we are signed in
            if (!isSignedIn() && !(await isDemoModeEnabled())) {
                logger.debug('Not signed in, stopping location services');

                try {
                    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                } catch (e) {
                    logger.error(e, `failed to stop ${LOCATION_TASK_NAME} task.`);
                } finally {
                    // such we ignore the event
                    AsyncStorage.setItem(LOCATION_TASK_NAME, false.toString());
                }
            } else {
                // do something with the locations captured in the background
                await handleLocationUpdate(locations);
            }
        } else {
            logger.debug('no locations?');
        }
    } catch (error) {
        logger.error(error, 'runLocationUpdate');
    } finally {
        try { getReduxPersistor().flush(); } catch (pe) {
            logger.error(pe, 'Could not persist redux');
        }
    }
}
