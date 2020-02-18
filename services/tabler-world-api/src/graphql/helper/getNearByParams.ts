import { getParameters, Param_Nearby } from '@mskg/tabler-world-config';

export const getNearByParams = async () => {
    const { nearby } = await getParameters('nearby');
    return JSON.parse(nearby) as Param_Nearby;
};
