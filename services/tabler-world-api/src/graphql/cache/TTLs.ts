import { defaultTTLs, getParameters, Param_TTLS } from '@mskg/tabler-world-config';

// tslint:disable-next-line: variable-name
export const TTLs = async () => {
    const p = await getParameters('cachettl', false);
    const ttls = p.cachettl ? JSON.parse(p.cachettl) : {};

    return {
        ...defaultTTLs,
        ...ttls,
    } as Param_TTLS;
};
