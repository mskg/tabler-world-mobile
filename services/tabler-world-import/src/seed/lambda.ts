import { makeCacheKey } from '@mskg/tabler-world-cache';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';
import { cacheInstance } from '../cache/cacheInstance';

// tslint:disable-next-line: export-name
export const handler: Handler<void, void> = async (event, context, callback) => {

    // max degree 3
    await withDatabase(context, async (client) => {
        const data = await client.query('select * from profiles where removed = false');
        data.rows.forEach((row) => {
            const key = makeCacheKey('Member', [row.id]);
            await cacheInstance.set(key, JSON.stringify(row));
        });
    });

    callback();
};
