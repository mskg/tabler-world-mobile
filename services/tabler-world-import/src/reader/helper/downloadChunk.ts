import { getParameters, Param_Api } from '@mskg/tabler-world-config';
import { parse } from 'url';
import { HttpClient } from '../../shared/HttpClient';
import { TablerWorldApiChunk } from '../types/TablerWorldApiChunk';
import { TargetType } from '../types/TargetType';

/**
 * Download a TablerWorldApiChunk from the given url.
 *
 * @param url
 * @param method
 * @param postdata
 */
export async function downloadChunk(target: TargetType, url: string, limit: number, method?: string, postdata?: string): Promise<TablerWorldApiChunk> {
    const params = await getParameters('tw-api');
    const api = JSON.parse(params['tw-api']) as Param_Api;

    const client = new HttpClient(api.host);

    client.headers = {
        Authorization: `Token ${api.keys[target]}`,
    };

    const json = await client.callApi<any>(
        `${url}&limit=${limit}`, method, postdata);

    const results = [];
    results.push(... (json.results || json));

    const parsed = parse(url, true);
    return {
        data: results,
        next: json.next,
        offset: (parsed.query
            ? parseInt(parsed.query.offset as string || '-1', 10)
            : -1) || -1,
        total: json.count || -1,
    };
}
