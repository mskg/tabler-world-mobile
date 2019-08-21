import * as Location from "expo-location";
import { Feature, FeatureCollection } from "geojson";
import _ from 'lodash';
import { AppState } from 'react-native';
import { Categories, Logger } from './Logger';

export const logger = new Logger(Categories.Helpers.Geo);

type EarthLocation = {
  latitude: number,
  longitude: number,
};

export async function reverseGeocode(location: EarthLocation): Promise<Location.Address | undefined> {
  let address: Location.Address | undefined = undefined;
  let backup: Location.Address | undefined = undefined

  try {
    // geocoding not allowed in background state
    // https://developer.apple.com/documentation/corelocation/clgeocoder
    if (AppState.currentState === "active") {
      try {
        // might fail if no key on android
        const coded = await Location.reverseGeocodeAsync(location);
        address = coded && coded.length > 0 ? coded[0] : undefined;

        if (address && address.city == null) {
          backup = address;
          address = undefined;
        }
      }
      catch (e) {
        logger.error(e, "could not geocode using Location", location);
      }
    }

    // fallback to photon
    if (address == null) {
      address = await photon(location);
    }

    const result = address || backup;
    if (result) {
      logger.log("Geocoded", location, "to", result);

      //@ts-ignore
      if (result.isoCountryCode) {
        //@ts-ignore
        result.country = result.isoCountryCode;
      }
    }

    return result;
  }
  catch (e) {
    logger.error(e, "could not geocode", location);
  }

  return undefined;
}

const deCountries = require("../i18n/countries/de.json");
const reversed = _(deCountries.countries).entries().reduce(
  (p, c) => {
    p[c[1].toUpperCase()] = c[0];
    return p;
  }, {}
);

async function photon(location: EarthLocation): Promise<Location.Address | undefined> {
  const result = await fetch(`https://photon.komoot.de/reverse?lon=${location.longitude}&lat=${location.latitude}&lang=de&limit=1`, {
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

  const isoCountryCode = reversed[(props["country"] ||"").toUpperCase()];

  return {
    // @ts-ignore
    name: props["name"],
    street: props["street"] || props["name"] + (props["housenumber"] ? " " + props["housenumber"] : ""),
    // streetNumber: props["housenumber"],
    postalCode: props["postcode"],
    city: props["city"],
    region: props["state"],
    //@ts-ignore
    isoCountryCode: isoCountryCode !== "" ? isoCountryCode : undefined,
    country: props["country"],
  };
}
