import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import _ from 'lodash';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { bootstrapApollo } from '../../apollo/bootstrapApollo';
import { reverseGeocode } from '../../helper/geo/reverseGeocode';
import { PutLocation, PutLocationVariables } from '../../model/graphql/PutLocation';
import { EnableLocationServicesMutation } from '../../queries/Location/EnableLocationServicesMutation';
import { PutLocationMutation } from '../../queries/Location/PutLocationMutation';
import { setLocation } from '../../redux/actions/location';
import { getReduxStore, persistorRehydrated } from '../../redux/getRedux';
import { LOCATION_TASK_NAME } from '../Constants';
import { isSignedIn } from '../helper/isSignedIn';
import { logger } from './logger';
import { isDemoModeEnabled } from '../../helper/demoMode';

// tslint:disable-next-line: export-name
export async function handleLocationUpdate(locations: Location.LocationData[], enable = false, force = false): Promise<boolean> {
    try {
        logger.debug('handleLocationUpdate', locations);

        await persistorRehydrated();
        if (!isSignedIn() && !(await isDemoModeEnabled())) {
            logger.debug('Not signed in, stopping location services');

            try {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            } catch (e) {
                logger.error(e, `failed to stop ${LOCATION_TASK_NAME} task.`);
            }

            return false;
        }

        const location = _(locations).maxBy((l) => l.timestamp) as Location.LocationData;
        if (location == null) {
            logger.error(new Error('No location found?'));
            return false;
        }

        const existing = getReduxStore().getState().location.location;
        if (existing
            && existing.coords
            && existing.coords.longitude === location.coords.longitude
            && existing.coords.latitude === location.coords.latitude
            && !force) {
            logger.debug('Ignoring coordinates');
            return true;
        }

        const ci = await NetInfo.fetch();
        const offline = ci.type === 'none' || ci.type === 'unknown';

        if (offline) {
            logger.log('Network seems to be offline', ci);

            getReduxStore().dispatch(setLocation({
                location,
            }));

            return false;
        }

        Audit.trackEvent(AuditEventName.LocationUpdate);

        // can be undefined
        const address = await reverseGeocode(location.coords);

        // const address = await Location.reverseGeocodeAsync(location.coords);
        getReduxStore().dispatch(setLocation({
            location,
            address,
        }));

        const client = await bootstrapApollo();
        await client.mutate<PutLocation, PutLocationVariables>({
            mutation: enable ? EnableLocationServicesMutation : PutLocationMutation,
            variables: {
                location: {
                    address,
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                    accuracy: location.coords.accuracy,
                    speed: location.coords.speed,
                },
            },
        });

        return true;
    } catch (error) {
        logger.error(error, LOCATION_TASK_NAME);
        return false;
    }
}
