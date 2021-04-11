import { createRemoveFromDatabaseHandler } from '../helper/createRemoveFromDatabaseHandler';
import { downloadChunk } from '../helper/downloadChunk';
import { fetchParallel } from '../helper/fetchParallel';
import { ChangePointer } from '../types/ChangePointer';
import { JobType } from '../types/JobType';
import { TablerWorldApiChunk } from '../types/TablerWorldApiChunk';
import { TargetType } from '../types/TargetType';
import { WorkflowResult } from './workflowType';

export async function removalWorkflow(
    type: JobType, target: TargetType,
    url: string, method: string, postData: any,
    limit: number, offset: number = 0, maxRecords: number = Infinity.valueOf(),
): Promise<WorkflowResult> {
    let totalRecords = 0;
    let processedRecords = 0;
    const modifications: ChangePointer[] = [];

    const databaseWriter = createRemoveFromDatabaseHandler(type);

    // tracks modifications and maintains global array of changed records
    const modificationTracker = async (data: any[]) => {
        processedRecords += data ? data.length : 0;
        const result = await databaseWriter(data);
        modifications.push(...result);
    };

    const urlWithOffset = `${url}offset=${offset}`;

    // read data
    const firstChunk: TablerWorldApiChunk<any> = await downloadChunk(target, urlWithOffset, limit, method, postData);
    if (firstChunk != null) {
        // we preserve the total
        totalRecords = firstChunk.total;

        await modificationTracker(firstChunk.data);

        if (maxRecords != null && firstChunk.total > (offset + maxRecords)) {
            console.log('MODIFIED maxRecords to', offset + maxRecords);
            firstChunk.total = offset + maxRecords;
        }

        await fetchParallel(target, firstChunk, modificationTracker, limit, method, postData);
    }

    return { processedRecords, modifications, totalRecords };
}
