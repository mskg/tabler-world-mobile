import { makeCacheKey } from "../cache/makeCacheKey";
import { TTLs } from "../cache/TTLs";
import { writeThrough } from "../cache/writeThrough";
import { useDataService } from "../rds/useDataService";
import { IApolloContext } from "../types/IApolloContext";

export const RolesResolver = {
    Query: {
        Roles: async (_root: any, _args: any, context: IApolloContext) => {
            return writeThrough(
                context,
                makeCacheKey("Structure", ["roles", context.principal.association]),
                () =>

                useDataService(
                        context,
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
                    ),
                TTLs.Structure,
            );
        }
    }
}