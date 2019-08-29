import { AsyncThrottle } from "@mskg/tabler-world-common";
import { getParameters, Param_Api } from "@mskg/tabler-world-config";
import { DataHandler } from "../types/DataHandler";
import { TablerWorldApiChunk } from "../types/TablerWorldApiChunk";
import { downloadChunk } from "./downloadChunk";
import { pushChanges } from "./pushChanges";

// 60*1000 / 100
const throttledDownload = AsyncThrottle(downloadChunk, 800, 1);

/**
 * We download all chunks for a given root API. The API allows max of 100 calls per minute.
 * We parallize the calls as good as possible with the given constraints.
 *
 * @param chunk Initial chunk
 * @param handler The data flows here
 * @param method GET, POST?
 * @param payload Subsent calls need e.g. a filter?
 */
export async function fetchParallel(
    chunk: TablerWorldApiChunk,
    handler: DataHandler,
    method?: string,
    payload?: string
) {
    if (chunk == null || chunk.next == null) { return; }

    // throtteling?
    const params = await getParameters('tw-api');
    const api = JSON.parse(params["tw-api"]) as Param_Api;

    const batch = [];
    let end = false;
    let start = chunk.offset == -1
        ? 0
        : chunk.offset;

    do {
        start += api.read_batch;
        end = start > chunk.total;

        // last segment?
        if (!end) {
            let nextUrl = chunk.next.substring(0, chunk.next.indexOf("?"));
            nextUrl += "?offset=" + start;

            console.log("kicking", nextUrl);
            batch.push(throttledDownload(nextUrl, method, payload));
        }

        // other batches waiting?
        if (batch.length >= api.batch / api.read_batch) {
            console.log("waiting for batch");

            const resultChunks = await Promise.all(batch);
            await pushChanges(resultChunks, handler);
            batch.splice(0, batch.length);
        }
    }
    while (!end);

    // wait for other segments
    console.log("waiting to end");
    const resultsChunks = await Promise.all(batch);
    await pushChanges(resultsChunks, handler);
}
