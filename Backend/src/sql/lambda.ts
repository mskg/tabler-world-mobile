import { Context } from "aws-lambda";
import { readFileSync } from "fs";
import { writeJobLog } from "../shared/jobs/writeJobLog";
import { withClient } from "../shared/rds/withClient";

const fileNames = [
    require("./00 setup.pgsql"),
    require("./01 tablers.pgsql"),
    require("./01 settings.pgsql"),
    require("./01 clubs.pgsql"),
    require("./02 roles.pgsql"),
    require("./04 profiles.pgsql"),
    require("./04 privacy.pgsql"),
    require("./05 structure.pgsql"),
    require("./06 notifications_birthdays.pgsql"),
    require("./07 search.pgsql"),
    require("./08 jobs.pgsql"),
];

export async function handler(_event: Array<any>, context: Context, _callback: (error: any, success?: any) => void) {
    try {
        await withClient(context, async (client) => {
            for (let i = 0; i < fileNames.length; ++i) {
                const fn = fileNames[i];

                console.log("Processing", fn);

                // replace role definition
                var content = readFileSync(fn, 'utf8');
                content = content.replace("tw_read_dev", process.env.db_role || "tw_read_dev");

                // await withTransaction(client,
                //     async () => await client.query(content));

                await client.query(content);
                console.log("done.");
            }

            await writeJobLog(client, "update::database");
            console.log("finished");
        });

        return true;
    } catch (e) {
        try {
            await withClient(context, async (client) => {
                await writeJobLog(client, "update::database", false, {
                    error: e
                });
            })
        }
        catch { }

        console.error(e);
        throw e;
    }
};
