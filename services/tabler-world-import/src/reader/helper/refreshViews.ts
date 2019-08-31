import { IDataService } from "@mskg/tabler-world-rds-client";

/**
 * Refresh all materialized views.
 */
export const refreshViews = async (client: IDataService) => {
    console.log("Updating views");

    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY profiles");
    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY profiles_privacysettings");
    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY structure_tabler_roles");
    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY structure_clubs");
    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY structure_associations");
    await client.query("REFRESH MATERIALIZED VIEW CONCURRENTLY structure_areas");
};
