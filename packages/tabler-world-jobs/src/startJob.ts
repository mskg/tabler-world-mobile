import { IDataService } from '@mskg/tabler-world-rds-client';
import { JobStatus } from './JobStatus';
import { replaceErrors } from './replaceErrors';

export async function startJob(client: IDataService, job: string, data: any = {}): Promise<number> {
    const result = await client.query(
        `
INSERT INTO jobhistory (runon, name, status, data)
VALUES(now(), $1, $2, $3)
RETURNING id
`,
        [
            job,
            JobStatus.Running,
            JSON.stringify(data, replaceErrors),
        ],
    );

    return result.rows[0].id;
}
