import { getParameters, Param_TTLS } from '@mskg/tabler-world-config';

export const TTLs = async () => {
    const p = await getParameters('cachettl');
    return JSON.parse(p.cachettl) as Param_TTLS;
};

// s
export const DEFAULT_TTL = parseInt(process.env.TTL_DEFAULT || (60 * 60 * 24 * 2).toString(), 10);
