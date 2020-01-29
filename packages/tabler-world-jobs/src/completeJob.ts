import { IDataService } from '@mskg/tabler-world-rds-client';
import { JobStatus } from './JobStatus';
import { replaceErrors } from './replaceErrors';
export async function completeJob(client: IDataService, jobId: number, success: boolean = true, data: any = {}) {
    await client.query(
        `
UPDATE jobhistory
SET
    status = $2,
    data = $3
WHERE
    id = $1
`,
        [
            jobId,
            success ? JobStatus.Success : JobStatus.Failed,
            JSON.stringify(data, replaceErrors),
        ],
    );
}
