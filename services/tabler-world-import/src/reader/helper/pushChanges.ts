import { DataHandler } from "../types/DataHandler";

/**
 * If we have data, push it down to the handler and wait for it.
 *
 * @param resultChunks
 * @param handler
 */
export async function pushChanges(resultChunks: any[], handler: DataHandler) {
    let result: any[] = [];

    resultChunks.forEach(c => {
        result.push(...((c ? c.data : null) || []));
    });

    if (result.length > 0) {
        await handler(result);
    }
}
