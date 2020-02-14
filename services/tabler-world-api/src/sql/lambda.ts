import { writeJobLog } from '@mskg/tabler-world-jobs';
import { withClient } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { readFileSync } from 'fs';

const fileNames = [
    // tslint:disable: no-var-requires
    require('./00 setup.pgsql').default,
    require('./01 tablers.pgsql').default,
    require('./01 settings.pgsql').default,
    require('./01 clubs.pgsql').default,
    require('./01 areas.pgsql').default,
    require('./01 associations.pgsql').default,
    require('./01 families.pgsql').default,
    require('./01 groups.pgsql').default,
    require('./01 assets.pgsql').default,
    require('./02 helper.pgsql').default,
    require('./02 roles.pgsql').default,
    require('./04 profiles.pgsql').default,
    require('./04 privacy.pgsql').default,
    require('./05 structure.pgsql').default,
    require('./06 notifications_birthdays.pgsql').default,
    require('./07 search.pgsql').default,
    require('./08 jobs.pgsql').default,
    require('./09 geocode.pgsql').default,
];

// tslint:disable-next-line: export-name variable-name
export async function handler(_event: any[], context: Context, _callback: (error: any, success?: any) => void) {
    try {
        await withClient(context, async (client) => {
            for (const fn of fileNames) {
                console.log('Processing', fn);

                // replace role definition
                let content = readFileSync(fn, 'utf8');
                content = content.replace('tw_read_dev', process.env.db_role || 'tw_read_dev');

                // await withTransaction(client,
                //     async () => await client.query(content));

                await client.query(content);
                console.log('done.');
            }

            await writeJobLog(client, 'update::database');
            console.log('finished');
        });

        return true;
    } catch (e) {
        try {
            await withClient(context, async (client) => {
                await writeJobLog(client, 'update::database', false, {
                    error: e,
                });
            });
        } catch { }

        console.error(e);
        throw e;
    }
}
