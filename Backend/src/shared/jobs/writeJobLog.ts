
import { IDataService } from "../rds/IDataService";

// https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
function replaceErrors(_key: string, value: any) {
    if (value instanceof Error) {
        var error = {};

        Object.getOwnPropertyNames(value).forEach(function (key) {
            //@ts-ignore
            error[key] = value[key];
        });

        return error;
    }

    return value;
}

export async function writeJobLog(client: IDataService, job: string, success: boolean = true, data: any = {}) {
    await client.query(`
INSERT INTO jobhistory (runon, name, success, data)
VALUES(now(), $1, $3, $2)
`, [job, JSON.stringify(data, replaceErrors), success]);
}
