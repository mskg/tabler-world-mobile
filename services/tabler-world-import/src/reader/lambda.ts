import { StopWatch } from '@mskg/tabler-world-common';
import { writeJobLog } from '@mskg/tabler-world-jobs';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { CONFIGURATIONS } from './Configurations';
import { continueExecution } from './helper/continueExecution';
import { gunzipAsync } from './helper/gzip';
import { importWorkflow } from './helper/importWorkflow';
import { pushCacheUpdates } from './helper/pushCacheUpdates';
import { refreshViews } from './helper/refreshViews';
import { validateImportEvent } from './helper/validateImportEvent';
import { AnyOperationMode } from './types/AnyOperationMode';
import { ChangePointer } from './types/ChangePointer';
import { CompressedContinueEvent, ContinueEvent } from './types/ContinueEvent';
import { ImportEvent } from './types/ImportEvent';
import { JobType } from './types/JobType';
import { OperationMode } from './types/OperationMode';

// tslint:disable: max-func-body-length
// tslint:disable: export-name
export async function handler(rawEvent: ImportEvent | ContinueEvent | CompressedContinueEvent, context: Context, callback: (error: any, success?: any) => void) {
    let importEvent: ImportEvent;

    const allModifications: ChangePointer[] = [];
    let totalProcessedRecords = 0;
    let totalTime = 0;
    let totalRecursion = 0;

    if (rawEvent.type === 'continue' || rawEvent.type === 'c') {
        let continueEvent: ContinueEvent = rawEvent as ContinueEvent;

        if (rawEvent.type === 'c') {
            const data = await gunzipAsync(Buffer.from(rawEvent.d));
            continueEvent = JSON.parse(data.toString('utf-8'));
        }

        // we initialize from existing time
        importEvent = continueEvent.event;

        allModifications.push(...continueEvent.changes);
        totalProcessedRecords += continueEvent.log.records;
        totalTime = continueEvent.log.elapsedTime;
        totalRecursion = continueEvent.log.calls;
    } else {
        importEvent = rawEvent;
    }

    validateImportEvent(importEvent);

    let activeMode: AnyOperationMode = OperationMode.full;
    if (importEvent.mode != null) {
        activeMode = importEvent.mode;
    }

    const jobName = `update::${importEvent.type}::${activeMode}::${totalRecursion}`;

    try {
        const activeConfiguration = CONFIGURATIONS[importEvent.type][activeMode];
        if (activeConfiguration == null) { throw new Error(`Unknown mode ${activeMode}`); }

        const url = activeConfiguration.url;
        const method = activeConfiguration.method;
        const postData = activeConfiguration.payload();

        await withDatabase(context, async (client) => {
            const watch = new StopWatch();

            const { processedRecords, modifications, totalRecords } = await importWorkflow(
                client,
                importEvent.type as JobType,
                url, method, postData,
                importEvent.offset, importEvent.maxRecords,
            );

            totalTime += watch.stop();
            allModifications.push(...modifications);
            totalProcessedRecords += processedRecords;
            let refreshTime = 0;

            if (totalRecords > totalProcessedRecords) {
                await continueExecution({
                    type: 'continue',
                    changes: allModifications,
                    event: {
                        ...importEvent,
                        offset: totalProcessedRecords,
                    },
                    log: {
                        elapsedTime: totalTime,
                        records: totalProcessedRecords,
                        calls: totalRecursion + 1,
                    },
                });
            } else {
                // we now know how many changes we have
                const modifiedRecords = allModifications.length;
                watch.start();

                if (modifiedRecords > 0) {
                    console.log('Found', allModifications.length, 'updates');

                    if (!importEvent.noRefreshViews) {
                        // if we modified something, update the views
                        await refreshViews(client);
                    }
                    refreshTime = watch.stop();

                    if (!importEvent.noUpdateCache) {
                        await pushCacheUpdates(allModifications);
                    }
                }
            }

            // telemetry
            await writeJobLog(client, jobName, true, {
                records: totalRecords,
                modified: totalProcessedRecords,

                readTime: totalTime,
                refreshTime,

                offset: importEvent.offset || 0,
                maxRecords: importEvent.maxRecords || 0,
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
}


