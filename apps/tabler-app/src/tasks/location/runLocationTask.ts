import * as Location from 'expo-location';
import AsyncStorage from '@react-native-community/async-storage';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { bootstrapApollo, getApolloCachePersistor } from '../../apollo/bootstrapApollo';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { getReduxPersistor, persistorRehydrated } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../Constants';
import { logger } from '../fetch/logger';
import { isSignedIn } from '../helper/isSignedIn';
import { handleLocationUpdate } from './handleLocationUpdate';
import { isLocationTaskEnabled } from './isLocationTaskEnabled';
import { LocationObject } from 'expo-location';

export async function runLocationTask({ data, error }) {
    try {
        logger.debug('runLocationTask');
        if (!(await isLocationTaskEnabled())) {
            return;
        }

        Audit.trackEvent(AuditEventName.LocationUpdate);

        if (error) {
            logger.error('task-location', error);
            return;
        }

        const locations: LocationObject[] = (data as any)?.locations;
        if (locations) {
            await persistorRehydrated();
            const demoMode = await isDemoModeEnabled();

            // we only run in demo mode or if we are signed in
            if (!isSignedIn() && !demoMode) {
                logger.debug('Not signed in, stopping location services');

                try {
                    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                } catch (e) {
                    logger.error('task-location-signed-out', e);
                } finally {
                    // such we ignore the event
                    await AsyncStorage.removeItem(LOCATION_TASK_NAME);
                }
            } else {
                await bootstrapApollo({ noWebsocket: true });
                await getApolloCachePersistor().restore();

                const result = await handleLocationUpdate(locations);
                // do something with the locations captured in the background
                if (result) {
                    logger.log('Persisting');

                    try { await getApolloCachePersistor().persist(); } catch (pe) {
                        logger.error('task-location-persist', pe);
                    }
                } else {
                    logger.log('Not persisting');
                }
            }
        } else {
            logger.debug('no locations?');
        }
    } catch (error) {
        logger.error('task-location', error);
    } finally {
        try { getReduxPersistor().flush(); } catch (pe) {
            logger.error('task-location-persist', pe);
        }
    }
}
