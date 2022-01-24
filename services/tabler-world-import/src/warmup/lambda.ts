import { IDataService, withDatabase } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';
import { ioRedisClient } from '../cache/ioRedisClient';
import { cache } from './cache';
import { clearCache } from './clearCache';
import { putLocation } from './putLocation';

async function cacheGeo(client: IDataService) {
    const ds = await client.query(`
 SELECT
    member,
    family,
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

type Params = {
    action?: string,
    types?: string[],
};

// tslint:disable-next-line: export-name
export const handler: Handler<Params, void> = async (event, context) => {
    if (!event.action || event.action === 'init') {

        await withDatabase(context, async (client) => {
            const promises = [];

            if (!event.types || event.types?.find((p) => p === 'member')) {
                promises.push(cache(client, 'Member', 'Member', `select * from profiles where removed = FALSE`));
            }

            if (!event.types || event.types?.find((p) => p === 'member')) {
                promises.push(cache(client, 'Club', 'Structure', `select * from structure_clubs`));
            }

            if (!event.types || event.types?.find((p) => p === 'area')) {
                promises.push(cache(client, 'Area', 'Structure', `select * from structure_areas`));
            }

            if (!event.types || event.types?.find((p) => p === 'association')) {
                promises.push(cache(client, 'Association', 'Structure', `select * from structure_associations`));
            }

            if (!event.types || event.types?.find((p) => p === 'family')) {
                promises.push(cache(client, 'Family', 'Structure', `select * from structure_families`));
            }

            if (!event.types || event.types?.find((p) => p === 'geo')) {
                promises.push(cacheGeo(client));
            }

            await Promise.all(promises);
        });
    } else if (event.action === 'clear') {
        console.log('Removed keys', await clearCache(ioRedisClient));
    }
};
