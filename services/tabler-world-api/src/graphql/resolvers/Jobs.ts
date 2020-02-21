import { useDataService } from '@mskg/tabler-world-rds-client';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable: export-name
// tslint:disable: variable-name
export const JobsResolver = {
    Job: {
        // deprecated
        success: (root: any, _args: any, _context: IApolloContext) => {
            return root.status === 'completed' || root.status === 'running';
        },
    },

    Query: {
        Jobs: async (_root: any, _args: any, context: IApolloContext) => {
            return useDataService(context, async (client) => {
                const res = await client.query(`
select * from jobhistory
order by runon desc
limit 20`);

                return res.rows.map((r) => ({
                    ...r,
                    data: {
                        ...(r.data || {}),
                        jobname: r.name,
                        jobstatus: r.success,

                        // timespan is based on ms, we convert the data
                        refreshTime: r.refreshTime ? r.refreshTime * 1000 : undefined,
                        readTime: r.readTime ? r.readTime * 1000 : undefined,
                    },
                }));
            });
        },
    },

    JobResult: {
        __resolveType: (root: any, _context: IApolloContext) => {
            if (root.jobstatus === false) { return 'JobError'; }

            switch (root.jobname) {
                case 'update::database':
                    return 'JobEmpty';

                case 'push::send':
                case 'notifications::check':
                case 'notifications::sendBirthday':
                    return 'JobSend';

                default:
                    return 'JobSync';
            }

            return null;
        },
    },
};
