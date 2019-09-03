
import { IDataService } from '@mskg/tabler-world-rds-client';

// https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
// tslint:disable-next-line: variable-name
function replaceErrors(_key: string, value: any) {
    if (value instanceof Error) {
        const error = {};

        Object.getOwnPropertyNames(value).forEach((k) => {
            // @ts-ignore
            error[k] = value[k];
        });

        return error;
    }

    return value;
}

export async function writeJobLog(client: IDataService, job: string, success: boolean = true, data: any = {}) {
    await client.query(`
INSERT INTO jobhistory (runon, name, success, data)
VALUES(now(), $1, $3, $2)
`,                     [job, JSON.stringify(data, replaceErrors), success]);
}
