import { getParameters, Param_TTLS } from '@mskg/tabler-world-config';

// tslint:disable-next-line: variable-name
export const TTLs = async () => {
    const p = await getParameters('cachettl');
    return JSON.parse(p.cachettl) as Param_TTLS;
};

export const MEMORY_TTL = parseInt(process.env.TTL_MEMORY || (10 * 60).toString(), 10);
