
import { AsyncPool, ConsoleLogger } from '@mskg/tabler-world-common';
import { useDatabasePool } from '@mskg/tabler-world-rds-client';
import { geocode } from '../src/geocode/helper/geocode';

// withClient(undefined, (client) => encode(client, {
//     street1: "Mittlerer Pfad 45",
//     // postal_code: 70499,
//     city: "Stuttgart",
//     country: "DE",
// })).then(
//     (data) => console.log(data),
//     (reject) => console.error(reject),
// );

// komoot({
//     street1: 'Fleetschlößchen',
//     street2: 'Brooktorkai 17',
//     postal_code: 20467,
//     city: 'HAMBURG',
//     country: 'DE',
// }).then(
//     (data) => console.log(data),
//     (reject) => console.error(reject),
// );

console.log(process.env.http_proxy);
console.log(process.env.geocoder_throttle);

if (true) {
    useDatabasePool(
        { logger: new ConsoleLogger() },
        3,
        async (client) => {
            const result = await client.query(`select * from geocodes_alladresses`);

            await AsyncPool(10, result.rows, async (row) => {
                try {
                    await geocode(client, row.address);
                } catch (e) {
                    console.error(e);
                }
            });
        },
    ).then(() => console.log('end'));

}
