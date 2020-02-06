import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import _ from 'lodash';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { reverseGeocode } from '../../helper/geo/reverseGeocode';
import { PutLocation, PutLocationVariables } from '../../model/graphql/PutLocation';
import { EnableLocationServicesMutation } from '../../queries/Location/EnableLocationServicesMutation';
import { PutLocationMutation } from '../../queries/Location/PutLocationMutation';
import { setLocation } from '../../redux/actions/location';
import { getReduxStore } from '../../redux/getRedux';
import { logger } from './logger';

// tslint:disable-next-line: export-name
export async function handleLocationUpdate(locations: Location.LocationData[], enable = false, force = false): Promise<boolean> {
    try {
        logger.debug('handleLocationUpdate', locations);

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

        // we ignore unkown network state and try in that case
        const offline = ci.type === 'none';

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

        const client = cachedAolloClient();
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

        // we don't need to persist the apollo cache, we don't change it

        return true;
    } catch (error) {
        logger.error(error, 'handleLocationUpdate');
        return false;
    }
}
