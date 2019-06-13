import { AsyncThrottle } from "../helper/AsyncThrottle";
import { Chunk, downloadChunk } from "./downloadChunk";

const CHUNK_SIZE = 10;
const BATCH_SIZE = parseInt(process.env.batch_size || "100", 10) / CHUNK_SIZE;

// 60*1000 / 100
const throttledDownload = AsyncThrottle(downloadChunk, 800, 1);
type handlerFunc = (data: any[]) => Promise<any>;

async function push(resultChunks: any[], handler: handlerFunc) {
    let result: any[] = [];
    resultChunks.forEach(c => {
        result.push(... ((c ? c .data : null) || []));
    });

    if (result.length > 0) { await handler(result); }
}

export async function fetchParallel(
    chunk: Chunk,
    handler: handlerFunc,
    method?: string,
    payload?: string
) {
    if (chunk == null || chunk.next == null) { return; }

    const batch = [];
    let end = false;
    let start = chunk.offset == -1
        ? 0
        : chunk.offset;

    do {
        start += CHUNK_SIZE;
        end = start > chunk.total;

        if (!end) {
            let nextUrl = chunk.next.substring(0, chunk.next.indexOf("&offset="));
            nextUrl += "&offset=" + start;

            console.log("kicking", nextUrl);
            batch.push(throttledDownload(nextUrl, method, payload));
        }

        if (batch.length >= BATCH_SIZE) {
            console.log("waiting for batch");

            const resultChunks = await Promise.all(batch);
            await push(resultChunks, handler);
            batch.splice(0, batch.length);
        }
    }
    while (!end);

    console.log("waiting to end");
    const resultsChunks = await Promise.all(batch);
    await push(resultsChunks, handler);
}
