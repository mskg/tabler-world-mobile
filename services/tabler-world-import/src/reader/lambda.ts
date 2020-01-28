import { StopWatch } from '@mskg/tabler-world-common';
import { completeJob, startJob, writeJobLog } from '@mskg/tabler-world-jobs';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { continueExecution } from './helper/continueExecution';
import { importWorkflow } from './helper/importWorkflow';
import { pushCacheUpdates } from './helper/pushCacheUpdates';
import { refreshViews } from './helper/refreshViews';
import { setupJobContext } from './helper/setupJobContext';
import { CompressedContinueEvent, ContinueEvent } from './types/ContinueEvent';
import { ImportEvent } from './types/ImportEvent';
import { JobType } from './types/JobType';

// tslint:disable: export-name
export async function handler(rawEvent: ImportEvent | ContinueEvent | CompressedContinueEvent, context: Context, callback: (error: any, success?: any) => void) {
    const jobContext = await setupJobContext(rawEvent);

    const { event } = jobContext;
    let jobId: number;

    try {
        jobId = await withDatabase(context, (client) => startJob(client, jobContext.jobName, {
            offset: event.offset || 0,
            maxRecords: event.maxRecords || 0,
        }));

        const watch = new StopWatch();

        const { processedRecords, modifications, totalRecords } = await importWorkflow(
            event.type as JobType,
            jobContext.configuration.url, jobContext.configuration.method, jobContext.configuration.payload,
            event.offset,
            event.maxRecords,
        );

        jobContext.totalTime += watch.stop();
        jobContext.changePointer.push(...modifications);
        jobContext.totalProcessedRecords += processedRecords;
        let refreshTime = 0;

        if (totalRecords > jobContext.totalProcessedRecords) {
            await continueExecution({
                type: 'continue',
                changes: jobContext.changePointer,
                event: {
                    ...event,
                    offset: jobContext.totalProcessedRecords,
                },
                log: {
                    elapsedTime: jobContext.totalTime,
                    records: jobContext.totalProcessedRecords,
                    calls: jobContext.recursionLevel + 1,
                },
            });
        } else {
            // we now know how many changes we have
            const modifiedRecords = jobContext.changePointer.length;
            watch.start();

            if (modifiedRecords > 0) {
                console.log('Found', jobContext.changePointer.length, 'updates');

                if (!event.noRefreshViews) {
                    // if we modified something, update the views
                    await refreshViews();
                }

                refreshTime = watch.stop();

                if (!event.noUpdateCache) {
                    await pushCacheUpdates(jobContext.changePointer);
                }
            }
        }

        // telemetry
        await withDatabase(context, (client) => completeJob(client, jobId, true, {
            records: totalRecords,
            modified: jobContext.changePointer.length,

            readTime: jobContext.totalTime,
            refreshTime,

            offset: event.offset || 0,
            maxRecords: event.maxRecords || 0,
        }));

        callback(null, true);
    } catch (e) {
        try {
            await withDatabase(context, async (client) => {
                if (jobId) {
                    await completeJob(client, jobId, false, {
                        error: e,
                    });
                } else {
                    await writeJobLog(client, jobContext.jobName, false, {
                        error: e,
                    });
                }
            });
            // tslint:disable-next-line: no-empty
        } catch { }

        console.error(e);
        callback(e);
    }
}


