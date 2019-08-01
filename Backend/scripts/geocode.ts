
import { encode } from "../src/geo/encode";
import { withClient } from "../src/helper/withClient";

withClient(undefined, (client) => encode(client, {
    street1: "Mittlerer Pfad 4",
    // postal_code: 70499,
    city: "Stuttgart",
    country: "DE",
})).then(
    (data) => console.log(data),
    (reject) => console.error(reject),
);
