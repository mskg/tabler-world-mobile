import { makeCacheKey } from '@mskg/tabler-world-cache';
import { defaultTTLs, getParameters, Param_TTLS } from '@mskg/tabler-world-config';
import { IDataService, withDatabase } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';
import { cacheInstance } from '../cache/cacheInstance';

type CacheTypes = 'Members' | 'Member' | 'Structure' | 'Club' | 'Area' | 'Association' | 'Family' | 'Resource' | 'Principal';

const TTLs = async () => {
    const p = await getParameters('cachettl', false);
    const ttls = p.cachettl ? JSON.parse(p.cachettl) : {};

    return {
        ...defaultTTLs,
        ...ttls,
    } as Param_TTLS;
};

async function cache(client: IDataService, group: CacheTypes, timeout: keyof Param_TTLS, stmt: string) {
    const ttl = await TTLs();

    const ds = await client.query(stmt);
    for (const row of ds.rows) {
        // @ts-nocheck
        const key = makeCacheKey(group, [row.id]);
        await cacheInstance.set(key, JSON.stringify(row), { ttl: ttl[timeout] });
    }
}

// tslint:disable-next-line: export-name
export const handler: Handler<void, void> = async (_event, context, callback) => {

    await withDatabase(context, async (client) => {
        await Promise.all([
            cache(client, 'Member', 'Member', `select * from profiles where removed = FALSE`),
            cache(client, 'Club', 'Structure', `select * from structure_clubs`),
            cache(client, 'Area', 'Structure', `select * from structure_areas`),
            cache(client, 'Association', 'Structure', `select * from structure_associations`),
            cache(client, 'Family', 'Structure', `select * from structure_families`),
        ]);
    });

    callback();
};
