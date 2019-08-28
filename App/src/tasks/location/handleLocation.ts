import * as Location from "expo-location";
import { LocationData } from "expo-location";
import _ from "lodash";
import { NetInfo } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { bootstrapApollo } from "../../apollo/bootstrapApollo";
import { reverseGeocode } from '../../helper/geo/reverseGeocode';
import { PutLocation, PutLocationVariables } from "../../model/graphql/PutLocation";
import { EnableLocationServicesMutation, PutLocationMutation } from "../../queries/PutLocation";
import { setLocation } from "../../redux/actions/location";
import { getReduxStore } from "../../redux/getRedux";
import { LOCATION_TASK_NAME } from "../Constants";
import { isSignedIn } from '../isSignedIn';
import { logger } from './logger';

export async function handleLocationUpdate(locations: LocationData[], enable = false): Promise<boolean> {
  try {
    logger.debug("handleLocationUpdate", locations);

    if (!isSignedIn()) {
      logger.debug("Not signed in, stopping location services");

      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      catch (e) {
        logger.error(e, "failed to stop " + LOCATION_TASK_NAME + " task.");
      }

      return false;
    }

    const location = _(locations).maxBy(l => l.timestamp) as LocationData;
    if (location == null) {
      logger.error(new Error("No location found?"));
      return false;
    }

    const existing = getReduxStore().getState().location.location;
    if (existing
      && existing.coords
      && existing.coords.longitude == location.coords.longitude
      && existing.coords.latitude == location.coords.latitude) {
      logger.debug("Ignoring coordinates");
      return true;
    }

    const ci = await NetInfo.getConnectionInfo();
    const offline = ci.type === "none" || ci.type === "NONE";

    if (offline) {
      logger.log("Network seems to be offline", ci);

      getReduxStore().dispatch(setLocation({
        location: location,
      }));

      return false;
    }

    Audit.trackEvent(AuditEventName.LocationUpdate);

    // can be undefined
    let address = await reverseGeocode(location.coords);

    // const address = await Location.reverseGeocodeAsync(location.coords);
    getReduxStore().dispatch(setLocation({
      location: location,
      address
    }));

    const client = await bootstrapApollo();
    await client.mutate<PutLocation, PutLocationVariables>({
      mutation: enable ? EnableLocationServicesMutation : PutLocationMutation,
      variables: {
        location: {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          address
        }
      }
    });

    return true;
  }
  catch (error) {
    logger.error(error, LOCATION_TASK_NAME);
    return false;
  }
}
