
import { IDataService } from '@mskg/tabler-world-rds-client';
import { replaceErrors } from './replaceErrors';

export async function writeJobLog(client: IDataService, job: string, success: boolean = true, data: any = {}): Promise<number> {
    const result = await client.query(
        `
INSERT INTO jobhistory (runon, name, status, data)
VALUES(now(), $1, $2, $3)
RETURNING id
`,
        [
            job,
            success ? 'completed' : 'failed',
            JSON.stringify(data, replaceErrors),
        ],
    );

    return result.rows[0].id;
}
