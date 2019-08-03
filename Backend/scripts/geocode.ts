
import { photonImpl } from "../src/geo/implementations/Komoot";

// withClient(undefined, (client) => encode(client, {
//     street1: "Mittlerer Pfad 45",
//     // postal_code: 70499,
//     city: "Stuttgart",
//     country: "DE",
// })).then(
//     (data) => console.log(data),
//     (reject) => console.error(reject),
// );

photonImpl({
    street1: "Fleetschlößchen",
    street2: "Brooktorkai 17",
    postal_code: 20467,
    city: "HAMBURG",
    country: "DE",
}).then(
    (data) => console.log(data),
    (reject) => console.error(reject),
);
