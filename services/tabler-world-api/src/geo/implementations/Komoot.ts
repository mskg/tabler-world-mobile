import { Feature, FeatureCollection, Point } from "geojson";
import NodeGeocoder from "node-geocoder";
import querystring from "querystring";
import { addressToString } from "../addressToString";
import { callAPI } from "../httpHelper";
import { IAddress } from "../IAddress";

/*
{
    "features": [{
        "geometry": {
            "coordinates": [9.0959927, 48.8201768],
            "type": "Point"
        },
        "type": "Feature",
        "properties": {
            "osm_id": 21410557,
            "osm_type": "W",
            "extent": [9.094701, 48.8217035, 9.0977857, 48.8201709],
            "country": "Germany",
            "osm_key": "highway",
            "city": "Stuttgart",
            "osm_value": "unclassified",
            "postcode": "70499",
            "name": "Mittlerer Pfad",
            "state": "Baden-Württemberg"
        }
    }],
    "type": "FeatureCollection"

    {
        "features": [{
            "geometry": {
                "coordinates": [9.997926857916667, 53.54447245],
                "type": "Point"
            },
            "type": "Feature",
            "properties": {
                "osm_id": 60264117,
                "osm_type": "W",
                "extent": [9.9978485, 53.5445027, 9.9980064, 53.5444588],
                "country": "Germany",
                "osm_key": "amenity",
                "housenumber": "17",
                "city": "Hamburg",
                "street": "Brooktorkai",
                "osm_value": "restaurant",
                "postcode": "20457",
                "name": "Fleetschlösschen",
                "state": "Hamburg"
            }
        }],
        "type": "FeatureCollection"
    }
*/
export async function photonImpl(address: IAddress): Promise<NodeGeocoder.Entry | null> {
    console.log("runGeocode", address);

    const thisops: { [key: string]: string; } = {
        limit: "1",
        lang: "de",
        q: addressToString(address) as string,
    };

    const result: FeatureCollection = await callAPI("photon.komoot.de", "/api/?" + querystring.encode(thisops));
    console.log(JSON.stringify(result));

    if (result == null || result.features == null || result.features.length == 0) {
        return null;
    }

    const feature: Feature = result.features[0];
    const props = feature.properties || {};

    if (feature.geometry.type == "Point") {
        const geo = feature.geometry as Point;

        return {
            longitude: geo.coordinates[0],
            latitude: geo.coordinates[1],

            provider: "komoot.de",

            extra: {
                // @ts-ignore
                osm_id: props["osm_id"],
                osm_type: props["osm_type"],
                osm_key: props["osm_key"],
                osm_value: props["osm_value"],
            },

            // @ts-ignore
            name: props["name"],

            streetName: props["street"] || props["name"],
            streetNumber: props["housenumber"],

            zipcode: props["postcode"],
            city: props["city"],
            state: props["state"],
            country: props["country"],
        };
    }

    return null;
}
