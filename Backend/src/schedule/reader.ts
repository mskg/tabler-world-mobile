import { Context } from 'aws-lambda';
import { SQS } from "aws-sdk";
import { SendMessageBatchRequestEntry } from 'aws-sdk/clients/sqs';
import _ from 'lodash';
import { StopWatch } from '../helper/StopWatch';
import { withClient } from '../helper/withClient';
import { writeJobLog } from '../helper/writeJobLog';
import { CONFIGURATIONS } from './Configurationns';
import { Chunk, downloadChunk } from "./downloadChunk";
import { fetchParallel } from "./fetchParallel";
import { QueueEntry } from './QueueEntry';
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
            let allModifications: any[] = [];

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
                if (event.type === "clubs") {
                    await sqs.sendMessage({
                        QueueUrl: process.env.sqs_queue as string,
                        MessageBody: JSON.stringify({
                            type: "clubs",
                        } as QueueEntry),
                    }).promise();
                }
                else {
                    const messages = allModifications.map(id => ({
                        Id: `member_${id}`,
                        MessageBody: JSON.stringify({
                            type: "member",
                            id: id,
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
                }
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
