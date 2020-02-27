import { IDataService, withDatabase } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';
import { cache } from './cache';
import { putLocation } from './putLocation';

async function cacheGeo(client: IDataService) {
    const ds = await client.query(`
 SELECT
    member,
    address,
    lastseen,
    speed,
    accuracy,
    ST_X (point::geometry) AS longitude,
    ST_Y (point::geometry) AS latitude
FROM
    userlocations_match
 `);

    for (const row of ds.rows) {
        // @ts-nocheck
        await putLocation(row);
    }
}

// tslint:disable-next-line: export-name
export const handler: Handler<void, void> = async (_event, context) => {
    await withDatabase(context, async (client) => {
        await Promise.all([
            cache(client, 'Member', 'Member', `select * from profiles where removed = FALSE`),
            cache(client, 'Club', 'Structure', `select * from structure_clubs`),
            cache(client, 'Area', 'Structure', `select * from structure_areas`),
            cache(client, 'Association', 'Structure', `select * from structure_associations`),
            cache(client, 'Family', 'Structure', `select * from structure_families`),
            cacheGeo(client),
        ]);
    });
};
