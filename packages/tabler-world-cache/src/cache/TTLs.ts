import { defaultTTLs, getParameters, Param_TTLS } from '@mskg/tabler-world-config';

// tslint:disable-next-line: variable-name
export const TTLs = async () => {
    const p = await getParameters('cachettl');
    const ttls = p.cachettl ? JSON.parse(p.cachettl) : {};

    return {
        ...defaultTTLs,
        ...ttls,
    } as Param_TTLS;
};

export const MEMORY_TTL = parseInt(process.env.TTL_MEMORY || (10 * 60).toString(), 10);
