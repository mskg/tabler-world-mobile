import { StopWatch } from "@mskg/tabler-world-common";
import { writeJobLog } from "@mskg/tabler-world-jobs";
import { withDatabase } from "@mskg/tabler-world-rds-client";
import { Context } from "aws-lambda";
import { SQS } from "aws-sdk";
import { SendMessageBatchRequestEntry } from "aws-sdk/clients/sqs";
import _ from "lodash";
import { CacheUpdateQueueEntry } from "../shared/CacheUpdateQueueEntry";
import { CONFIGURATIONS } from "./Configurations";
import { createWriteToDatabaseHandler } from "./helper/createWriteToDatabaseHandler";
import { downloadChunk } from "./helper/downloadChunk";
import { fetchParallel } from "./helper/fetchParallel";
import { refreshViews } from "./helper/refreshViews";
import { validateImportEvent } from "./helper/validateImportEvent";
import { AnyOperationMode } from "./types/AnyOperationMode";
import { ChangePointer } from "./types/ChangePointer";
import { ImportEvent } from "./types/ImportEvent";
import { OperationMode } from "./types/OperationMode";
import { RecordType } from "./types/RecordType";
import { TablerWorldApiChunk } from "./types/TablerWorldApiChunk";

// tslint:disable: max-func-body-length
// tslint:disable: export-name
export async function handler(event: ImportEvent, context: Context, callback: (error: any, success?: any) => void) {
    validateImportEvent(event);

    let activeMode: AnyOperationMode = OperationMode.full;
    if (event.mode != null) {
        activeMode = event.mode;
    }

    const jobName = `update::${event.type}::${activeMode}`;

    try {
        const activeConfiguration = CONFIGURATIONS[event.type][activeMode];
        if (activeConfiguration == null) { throw new Error("Unknown mode " + activeMode); }

        const url = activeConfiguration.url;
        const method = activeConfiguration.method;
        const postData = activeConfiguration.payload();

        await withDatabase(context, async (client) => {
            const databaseWriter = createWriteToDatabaseHandler(client, event.type as RecordType);

            let total = 0;
            const allModifications: ChangePointer[] = [];

            // tracks modifications and maintains global array of changed records
            const modificationTracker = async (data: any[]) => {
                total += data ? data.length : 0;

                const result = await databaseWriter(data);
                allModifications.push(...result);
            };

            // we monitor the execution time
            const watch = new StopWatch();

            // read data
            const firstChunk: TablerWorldApiChunk<any> = await downloadChunk(url, method, postData);
            if (firstChunk != null) {
                await modificationTracker(firstChunk.data);
                await fetchParallel(firstChunk, modificationTracker, method, postData);
            }

            // we now know how many changes we have
            const modifiedRecords = allModifications.length;

            // done
            const readTime = watch.stop();

            watch.start();
            let refreshTime = 0;

            if (modifiedRecords > 0) {
                console.log("Found", allModifications.length, "updates");

                // if we modified something, update the views
                await refreshViews(client);
                refreshTime = watch.stop();

                const sqs = new SQS();

                const messages = allModifications.map((cp: ChangePointer) => ({
                    Id: `${cp.type}_${cp.id}`,
                    MessageBody: JSON.stringify({
                        // we map types here due to back compatibility
                        type: event.type === "clubs" ? "club" : "member",
                        id: cp.id,
                    } as CacheUpdateQueueEntry),
                }) as SendMessageBatchRequestEntry);

                // 10 is the AWS batch limit
                const messageChunks = _(messages).chunk(10).value();
                for (const chunk of messageChunks) {
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

            // telemetry
            await writeJobLog(client, jobName, true, {
                records: total,
                modified: modifiedRecords,
                readTime,
                refreshTime,
            });
        });

        callback(null, true);
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                await writeJobLog(client, jobName, false, {
                    error: e,
                });
            });
        // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
        callback(e);
    }
};
