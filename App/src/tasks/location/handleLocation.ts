import { LocationData } from "expo-location";
import _ from "lodash";
import { NetInfo } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { bootstrapApollo } from "../../apollo/bootstrapApollo";
import { reverseGeocode } from '../../helper/reverseGeocode';
import { PutLocation, PutLocationVariables } from "../../model/graphql/PutLocation";
import { EnableLocationServicesMutation, PutLocationMutation } from "../../queries/PutLocation";
import { setLocation } from "../../redux/actions/location";
import { getReduxStore } from "../../redux/getRedux";
import { LOCATION_TASK_NAME } from "../Constants";
import { logger } from './logger';

export async function handleLocationUpdate(locations: LocationData[], enable = false) {
  try {
    logger.debug("handleLocationUpdate", locations);

    const location = _(locations).maxBy(l => l.timestamp) as LocationData;
    if (location == null) {
      logger.error(new Error("No location found?"));
      return;
    }

    const existing = getReduxStore().getState().location.location;
    if (existing
      && existing.coords
      && existing.coords.longitude == location.coords.longitude
      && existing.coords.latitude == location.coords.latitude) {
      logger.debug("Ignoring coordinates");
      return;
    }

    const ci = await NetInfo.getConnectionInfo();
    const offline = ci.type === "none" || ci.type === "NONE";

    if (offline) {
      logger.log("Network seems to be offline", ci);

      getReduxStore().dispatch(setLocation({
        location: location,
      }));

      return;
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
  }
  catch (error) {
    logger.error(error, LOCATION_TASK_NAME);
  }
}
