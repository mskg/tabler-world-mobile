import { IDataService } from '@mskg/tabler-world-rds-client';

/**
 * Refresh all materialized views.
 */
export const refreshViews = async (client: IDataService) => {
    console.log('Updating views');

    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_groups');

    // dependent on groups
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles');

    // dependent on groups, and roles
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY profiles');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings');

    // dependent data
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations');
};
