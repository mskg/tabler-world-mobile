import * as Location from "expo-location";
import { Feature, FeatureCollection } from "geojson";
import { AppState } from 'react-native';
import { Categories, Logger } from './Logger';

export const logger = new Logger(Categories.Helpers.Geo);

type EarthLocation =  {
  latitude: number,
  longitude: number,
};

export async function reverseGeocode(location: EarthLocation): Promise<Location.Address | undefined> {
  let address;

  try {
    // geocoding not allowed in background state
    // https://developer.apple.com/documentation/corelocation/clgeocoder
    if (AppState.currentState === "active") {
      try {
        // might fail if no key on android
        const coded = await Location.reverseGeocodeAsync(location);
        address = coded && coded.length > 0 ? coded[0] : undefined;
      }
      catch (e) {
        logger.error(e, "could not geocode using Location", location);
      }
    }

    // fallback to photon
    if (address == null) {
      address = await photon(location);
    }

    logger.log("Geocoded", location, "to", address);
    return address;
  }
  catch (e) {
    logger.error(e, "could not geocode", location);
  }

  return undefined;
}


async function photon(location: EarthLocation): Promise<Location.Address | undefined> {
  const result = await fetch(`https://photon.komoot.de/reverse?lon=${location.longitude}&lat=${location.latitude}`, {
    method: "GET",
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const col: FeatureCollection = await result.json();
  if (col == null || col.features == null || col.features.length == 0) {
    return undefined;
  }

  const feature: Feature = col.features[0];
  const props = feature.properties || {};
  logger.debug("Geocoded", "to", props);

  return {
    // @ts-ignore
    name: props["name"],
    street: props["street"] || props["name"] + (props["housenumber"] ? " " + props["housenumber"] : ""),
    // streetNumber: props["housenumber"],
    postalCode: props["postcode"],
    city: props["city"],
    region: props["state"],
    country: props["country"],
  };
}
