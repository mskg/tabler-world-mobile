import { IDataService } from '../shared/rds/IDataService';

export const refreshViews = async (client: IDataService) => {
    console.log("Updating views");

    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY profiles');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings');

    // need to check if this is too much here
    // dequeue in other job?
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations');
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas');
    // await client.query('REFRESH MATERIALIZED VIEW structure');
};
