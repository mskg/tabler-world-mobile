import { IDataService } from '@mskg/tabler-world-rds-client';
import { ChangePointer } from '../types/ChangePointer';
import { JobType } from '../types/JobType';
import { TablerWorldApiChunk } from '../types/TablerWorldApiChunk';
import { createWriteToDatabaseHandler } from './createWriteToDatabaseHandler';
import { downloadChunk } from './downloadChunk';
import { fetchParallel } from './fetchParallel';

export async function importWorkflow(
    client: IDataService,
    type: JobType,
    url: string, method: string, postData: any,
    offset: number = 0, maxRecords: number = Infinity.valueOf(),
) {
    let totalRecords = 0;
    let processedRecords = 0;
    const modifications: ChangePointer[] = [];

    const databaseWriter = createWriteToDatabaseHandler(client, type as JobType);

    // tracks modifications and maintains global array of changed records
    const modificationTracker = async (data: any[]) => {
        processedRecords += data ? data.length : 0;
        const result = await databaseWriter(data);
        modifications.push(...result);
    };

    const urlWithOffset = `${url}offset=${offset}`;

    // read data
    const firstChunk: TablerWorldApiChunk<any> = await downloadChunk(urlWithOffset, method, postData);
    if (firstChunk != null) {
        // we preserve the total
        totalRecords = firstChunk.total;

        await modificationTracker(firstChunk.data);

        if (maxRecords != null && firstChunk.total > (offset + maxRecords)) {
            console.log('MODIFIED maxRecords to', offset + maxRecords);
            firstChunk.total = offset + maxRecords;
        }

        await fetchParallel(firstChunk, modificationTracker, method, postData);
    }

    return { processedRecords, modifications, totalRecords };
}
