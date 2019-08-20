import { useDataService } from "../../shared/rds/useDataService";
import { isAdmin } from "../auth/isAdmin";
import { IApolloContext } from "../types/IApolloContext";

export const JobsResolver = {
    Query: {
        Jobs: async (_root: any, _args: any, context: IApolloContext) => {
            if (!isAdmin(context.principal)) return null;

            return useDataService(context, async (client) => {
                const res = await client.query(`
select * from jobhistory
order by runon desc
limit 20`);

                return res.rows.map(r => ({
                    ...r,
                    data: {
                        ...(r["data"] || {}),
                        jobname: r["name"],
                        jobstatus: r["success"],
                    }
                }));
            });
        },
    },

    JobResult: {
        __resolveType: (root: any, _context: IApolloContext) => {
            console.log(root);
            if (root.jobstatus === false) return "JobError";

            switch (root.jobname) {
                case "update::database":
                    return "JobEmpty";

                case "update::tabler::full":
                case "update::tabler::incremental":
                case "update::clubs::full":
                case "update::clubs::incremental":
                    return "JobSync";

                default:
                    return "JobSend";
            }

            return null;
        },
    }
}