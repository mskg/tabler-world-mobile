import { IDataService } from "@mskg/tabler-world-rds-client";

export async function removeToken(client: IDataService, token: string) {
    console.log("Removing token", token);
    return await client.query(`
UPDATE usersettings
SET tokens =
(
    select array_agg(elem)
    from unnest(tokens) elem
    where elem <> $1 and elem is not null
)
WHERE tokens @> ARRAY[$1]`,
        [token]);
}