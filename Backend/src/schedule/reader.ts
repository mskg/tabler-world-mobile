import { Context } from 'aws-lambda';
import { StopWatch } from '../helper/StopWatch';
import { withClient } from '../helper/withClient';
import { writeJobLog } from '../helper/writeJobLog';
import { CONFIGURATIONS } from './Configurationns';
import { Chunk, downloadChunk } from "./downloadChunk";
import { fetchParallel } from "./fetchParallel";
import { refreshViews } from './refreshViews';
import { checkPayload, Event, Mode, Modes, Types } from './types';
import { writeValues } from './writeValues';

export async function handler(event: Event, context: Context, _callback: (error: any, success?: any) => void) {
    checkPayload(event);

    let modeToRun: Mode = Modes.full;
    if (event.mode != null) {
        modeToRun = event.mode;
    }

    const jobName = `update::${event.type}::${modeToRun}`;

    try {

        const config = CONFIGURATIONS[event.type][modeToRun];
        if (config == null) { throw new Error("Unknown mode " + modeToRun); }

        let url = config.url;
        let method = config.method;
        let postData = config.payload();

        await withClient(context, async (client) => {
            const innerWriter = writeValues(client, event.type as Types);

            let total = 0;
            const writer =  (data: Array<any>) => {
                total += data ? data.length : 0;
                return innerWriter(data);
            }

            const watch = new StopWatch();

            let firstChunk: Chunk<any> = await downloadChunk(url, method, postData);
            if (firstChunk != null) {
                await writer(firstChunk.data);
                await fetchParallel(firstChunk, writer, method, postData)
            }

            const readTime = watch.stop();

            watch.start();
            await refreshViews(client);
            const refreshTime = watch.stop();

            await writeJobLog(client, jobName, true, {
                records: total,
                readTime,
                refreshTime,
            });
        });

        return true;
    } catch (e) {
        try {
            await withClient(context, async (client) => {
                await writeJobLog(client, jobName, false, {
                    error: e,
                });
            })
        }
        catch { }

        console.error(e);
        throw e;
    }
};
