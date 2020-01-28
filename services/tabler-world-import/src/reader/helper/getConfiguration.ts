import { getParameters, Param_Api } from '@mskg/tabler-world-config';

export async function getConfiguration(): Promise<Param_Api> {
    // throtteling?
    const params = await getParameters('tw-api');
    return JSON.parse(params['tw-api']) as Param_Api;
}
