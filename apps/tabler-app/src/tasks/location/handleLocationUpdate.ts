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
            logger.log('No location found?');
            return false;
        }

        const existing = getReduxStore().getState().location.location;
        if (existing
            && existing.coords
            && existing.coords.longitude === location.coords.longitude
            && existing.coords.latitude === location.coords.latitude
            && !force) {
            logger.debug('Ignoring coordinates');
            return false;
        }

        Audit.trackEvent(AuditEventName.LocationUpdate);

        // can be undefined
        const encodedAddress = await reverseGeocode(location.coords);
        getReduxStore().dispatch(setLocation({
            location,
            address: encodedAddress?.address,
        }));

        const locationVariables = {
            address: encodedAddress?.raw,
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
        };

        const variables = enable
            ? {
                map: getReduxStore().getState().settings.nearbyMembersMap || false,
                location: locationVariables,
            }
            : { location: locationVariables };

        const client = cachedAolloClient();
        await client.mutate<PutLocation, PutLocationVariables>({
            variables,
            mutation: enable ? EnableLocationServicesMutation : PutLocationMutation,
        });

        // we don't need to persist the apollo cache, we don't change it

        return true;
    } catch (error) {
        logger.error('task-location-update', error);
        return false;
    }
}
