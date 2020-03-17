import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { useDatabase } from '@mskg/tabler-world-rds-client';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable: export-name
// tslint:disable: variable-name
export const RolesResolver = {
    Query: {
        Roles: async (_root: any, _args: any, context: IApolloContext) => {
            return cachedLoad(
                context,
                makeCacheKey('Structure', ['roles', context.principal.association]),
                () =>

                    useDatabase(
                        context,
                        async (client) => {
                            const res = await client.query(
                                `
select
    distinct functionname
from
    structure_tabler_roles
order by 1`,
                                [],
                            );

                            return res.rows.map((r) => r.functionname);
                        },
                    ),
                'Structure',
            );
        },
    },
};
