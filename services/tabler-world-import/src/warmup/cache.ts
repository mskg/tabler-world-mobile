import { makeCacheKey } from '@mskg/tabler-world-cache';
import { defaultTTLs, getParameters, Param_TTLS } from '@mskg/tabler-world-config';
import { IDataService } from '@mskg/tabler-world-rds-client';
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

export async function cache(client: IDataService, group: CacheTypes, timeout: keyof Param_TTLS, stmt: string) {
    const ttl = await TTLs();
    const ds = await client.query(stmt);
    for (const row of ds.rows) {
        // @ts-nocheck
        const key = makeCacheKey(group, [row.id]);
        await cacheInstance.set(key, JSON.stringify(row), { ttl: ttl[timeout] });
    }
}
