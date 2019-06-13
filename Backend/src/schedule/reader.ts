import { Context } from 'aws-lambda';
import { withClient } from '../helper/withClient';
import { CONFIGURATIONS } from './Configurationns';
import { Chunk, downloadChunk } from "./downloadChunk";
import { fetchParallel } from "./fetchParallel";
import { refreshViews } from './refreshViews';
import { checkPayload, Event, Mode, Modes, Types } from './types';
import { writeValues } from './writeValues';

export async function handler(event: Event, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        checkPayload(event);

        let modeToRun: Mode = Modes.full;
        if (event.mode != null) {
            modeToRun = event.mode;
        }

        const config = CONFIGURATIONS[event.type][modeToRun];
        if (config == null) { throw new Error("Unknown mode " + modeToRun); }

        let url = config.url;
        let method = config.method;
        let postData = config.payload();

        await withClient(context, async (client) => {
            const writer = writeValues(client, event.type as Types);

            let firstChunk: Chunk<any> = await downloadChunk(url, method, postData);
            if (firstChunk != null) {
                await writer(firstChunk.data);
                await fetchParallel(firstChunk, writer, method, postData)
            }

            await refreshViews(client);
        });

        return true;
    } catch (e) {
        throw e;
    }
};
