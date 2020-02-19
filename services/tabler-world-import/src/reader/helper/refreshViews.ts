import { useDatabase } from '@mskg/tabler-world-rds-client';

/**
 * Refresh all materialized views.
 */
export const refreshViews = async () => {
    await useDatabase({ logger: console }, async (client) => {
        console.log('Updating views');

        const dml = `
BEGIN;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups;

-- dependent on groups
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles;

-- dependent on groups, and roles
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles;
REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings;

-- dependent data
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations;
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_families;

-- indexes
REFRESH MATERIALIZED VIEW CONCURRENTLY structure_search;
COMMIT;
`;

        await client.query(dml);
    });
};
