import { Context } from 'aws-lambda';
import { SQS } from "aws-sdk";
import { SendMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';
import _ from 'lodash';
import { writeJobLog } from '../shared/jobs/writeJobLog';
import { withClient } from '../shared/rds/withClient';
import { StopWatch } from '../shared/StopWatch';
import { CONFIGURATIONS } from './Configurations';
import { Chunk, downloadChunk } from "./downloadChunk";
import { fetchParallel } from "./fetchParallel";
import { QueueEntry } from './QueueEntry';
import { refreshViews } from './refreshViews';
import { checkPayload, Event, Mode, Modes, Types } from './types';
import { ChangePointer, writeValues } from './writeValues';

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
            let allModifications: ChangePointer[] = [];

            const writer = async (data: Array<any>) => {
                total += data ? data.length : 0;

                const result = await innerWriter(data);
                allModifications.push(...result);
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

            const modified = allModifications.length;

            if (allModifications.length > 0) {
                console.log("Found", allModifications.length, "updates");

                var sqs = new SQS();

                const messages = allModifications.map((cp: ChangePointer) => ({
                    Id: `${cp.type}_${cp.id}`,
                    MessageBody: JSON.stringify({
                        // we map types here due to back compatibility
                        type: event.type === "clubs" ? "club" : "member",
                        id: cp.id,
                    } as QueueEntry),
                }) as SendMessageBatchRequestEntry);

                const messageChunks = _(messages).chunk(10).value();
                for (let chunk of messageChunks) {
                    console.log("Sending chunk");

                    const sendBatch = await sqs.sendMessageBatch({
                        QueueUrl: process.env.sqs_queue as string,
                        Entries: chunk,
                    }).promise();

                    if (sendBatch.Failed) {
                        console.error(sendBatch.Failed);
                    }
                }
                // }
            }

            await writeJobLog(client, jobName, true, {
                records: total,
                modified,
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
