import { Client } from 'pg';

export const refreshViews = async (client: Client) => {
    console.log("Updating views");

    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY profiles');
    await client.query('REFRESH MATERIALIZED VIEW profiles_privacysettings');

    // need to check if this is too much here
    // dequeue in other job?
    await client.query('REFRESH MATERIALIZED VIEW structure_tabler_roles');
    await client.query('REFRESH MATERIALIZED VIEW structure_clubs');
    await client.query('REFRESH MATERIALIZED VIEW structure_associations');
    await client.query('REFRESH MATERIALIZED VIEW structure_areas');
    // await client.query('REFRESH MATERIALIZED VIEW structure');
};
