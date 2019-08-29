import { getParameters, Param_Api } from "@mskg/tabler-world-config";
import { parse } from "url";
import { HttpClient } from "../../shared/HttpClient";
import { TablerWorldApiChunk } from "../types/TablerWorldApiChunk";

/**
 * Download a TablerWorldApiChunk from the given url.
 *
 * @param url
 * @param method
 * @param postdata
 */
export async function downloadChunk(url: string, method?: string, postdata?: string): Promise<TablerWorldApiChunk> {
    const params = await getParameters('tw-api');
    const api = JSON.parse(params["tw-api"]) as Param_Api;

    const client = new HttpClient(api.host);

    client.headers = {
        Authorization: `Token ${api.key}`,
    };

    const json = await client.callApi<any>(
        url + `&limit=${api.read_batch}`, method, postdata);

    const results = [];
    results.push(... (json.results || json));

    const parsed = parse(url, true);
    return {
        data: results,
        next: json.next,
        offset: (parsed.query
            ? parseInt(parsed.query.offset as string || "-1", 10)
            : -1) || -1,
        total: json.count || -1,
    };
}
