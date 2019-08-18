import * as Location from "expo-location";
import { LocationData } from "expo-location";
import * as TaskManager from "expo-task-manager";
import _ from "lodash";
import { AsyncStorage } from "react-native";
import { Audit } from '../analytics/Audit';
import { AuditEventName } from '../analytics/AuditEventName';
import { bootstrapApollo } from "../apollo/bootstrapApollo";
import { Categories, Logger } from "../helper/Logger";
import { GeoParameters } from '../helper/parameters/Geo';
import { getParameterValue } from '../helper/parameters/getParameter';
import { ParameterName } from '../model/graphql/globalTypes';
import { PutLocation, PutLocationVariables } from "../model/graphql/PutLocation";
import { PutLocationMutation } from "../queries/PutLocation";
import { setLocation } from "../redux/actions/location";
import { getReduxStore } from "../redux/getRedux";
import { LOCATION_TASK_NAME } from "./Constants";

const logger = new Logger(Categories.Sagas.Location);

export async function startLocationTask() {
  const enabled = await Location.hasServicesEnabledAsync();
  const started = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );

  if (enabled) {
    if (started) {
      logger.log(LOCATION_TASK_NAME, "already started");
    } else {
      try {
        logger.log("Starting task", LOCATION_TASK_NAME);

        await Location.requestPermissionsAsync();

        const settings = await getParameterValue<GeoParameters>(ParameterName.geo);
        delete settings.pollInterval;

        logger.debug("settings", settings);

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          ...settings,
        });

        const location = await Location.getCurrentPositionAsync();
        handleLocation([location]);
      } catch (e) {
        logger.error(e, `Start of ${LOCATION_TASK_NAME} failed`);
      }
    }
  } else {
    logger.log("*********** LOCATION SERVICES DISABLED ***********");
  }
}

async function handleLocation(locations: LocationData[]) {
  try {
    logger.debug("running", locations);
    Audit.trackEvent(AuditEventName.LocationUpdate);

    const location = _(locations).maxBy(l => l.timestamp) as LocationData;
    if (location == null) {
        logger.error(new Error("No location found?"));
        return;
    }

    const existing = getReduxStore().getState().location.location;
    if (existing && existing.coords
      && existing.coords.longitude == location.coords.longitude
      && existing.coords.latitude == location.coords.latitude
    ) {
      logger.debug("Ignoring coordinates");
      return;
    }

    const address = await Location.reverseGeocodeAsync(location.coords);

    logger.log("Geocoding", address);
    getReduxStore().dispatch(
      setLocation({
        location: location,
        address: address[0]
      })
    );

    const client = await bootstrapApollo();
    await client.mutate<PutLocation, PutLocationVariables>({
      mutation: PutLocationMutation,
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
  } catch (error) {
    logger.error(error, LOCATION_TASK_NAME);
  }
}

export async function registerLocationTask() {
  try {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
      if (error) {
        logger.error(error);
        return;
      }

      if (data) {
        // do something with the locations captured in the background
        const locations: LocationData[] = (data as any).locations;
        await handleLocation(locations);
      }
    });

    if ((await AsyncStorage.getItem(LOCATION_TASK_NAME)) === "true") {
      await startLocationTask();
    } else {
      logger.log("*********** nearbyMembers DISABLED ***********");
    }
  } catch (e) {
    logger.error(e, "Registering of tasks failed");
  }
}
