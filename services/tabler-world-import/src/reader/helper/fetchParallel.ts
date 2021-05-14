import { AsyncPool, AsyncThrottle } from '@mskg/tabler-world-common';
import { TablerWorldApiChunk } from '../types/TablerWorldApiChunk';
import { TargetTypes } from '../types/TargetType';
import { downloadChunk } from './downloadChunk';
import { getConfiguration } from './getConfiguration';
import { pushChanges } from './pushChanges';

// 60*1000 / 100
type downlodChunkType = typeof downloadChunk;
const throttledDownload: downlodChunkType = AsyncThrottle(downloadChunk, 800, 1);

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
    target: TargetTypes,
    chunk: TablerWorldApiChunk,
    handler: (data: any[]) => Promise<any>,
    limit: number,
    method?: string,
    payload?: string,
) {
    if (chunk == null || chunk.next == null) { return; }

    const api = await getConfiguration();
    let lastWriteBatch: Promise<void> | null = null;

    const batch: string[] = [];
    let end = false;
    let start = chunk.offset === -1
        ? 0
        : chunk.offset;

    const downloadFunc = (nextUrl: string): Promise<TablerWorldApiChunk<any>> => throttledDownload(target, nextUrl, limit, method, payload);

    do {
        start += limit;
        end = start > chunk.total;

        // last segment?
        if (!end) {
            let nextUrl = chunk.next.substring(0, chunk.next.indexOf('?'));
            nextUrl += `?offset=${start}`;

            batch.push(nextUrl);
        }

        // other batches waiting?
        if (batch.length >= api.batch / limit) {
            console.log('waiting for batch');

            const resultChunks = await AsyncPool(api.concurrency.read, batch, downloadFunc);

            // allow parallel write and read
            if (lastWriteBatch) {
                await lastWriteBatch;
                lastWriteBatch = null;
            }

            lastWriteBatch = pushChanges(resultChunks, handler);
            batch.splice(0, batch.length);
        }
    }
    while (!end);

    if (lastWriteBatch) {
        await lastWriteBatch;
        lastWriteBatch = null;
    }

    // wait for other segments
    console.log('waiting to end');
    const resultsChunks = await AsyncPool(api.concurrency.read, batch, downloadFunc);
    await pushChanges(resultsChunks, handler);
}
