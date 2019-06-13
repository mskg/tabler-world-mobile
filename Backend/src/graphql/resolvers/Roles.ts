import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

export const RolesResolver = {
    Query: {
        Roles: async (_root: any, _args: any, context: IApolloContext) => {
            return useDatabase(
                context.logger,
                async (client) => {
                    const res = await client.query(
                        `
select
    distinct name
from
    structure_tabler_roles
order by 1`,
                        []
                    );

                    return res.rows.map(r => r["name"]);
                }
            )
        }
    }
}