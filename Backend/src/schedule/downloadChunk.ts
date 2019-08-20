import { parse } from "url";
import { HttpClient } from "../shared/https/HttpClient";
import { getParameters } from "../shared/parameters/getParameters";
import { Param_Api } from "../shared/parameters/types";

export type Chunk<T = any> = {
    data: T[],
    next?: string,
    total: number,
    offset: number,
} | undefined;

export async function downloadChunk(url: string, method?: string, postdata?: string): Promise<Chunk> {
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
