import { IDataService } from '@mskg/tabler-world-rds-client';

export async function removeTokenWithId(client: IDataService, id: number, token: string) {
    console.log('Removing token', token);

    return await client.query(
        `
UPDATE usersettings
SET tokens =
(
    select array_agg(elem)
    from unnest(tokens) elem
    where elem <> $2 and elem is not null
)
WHERE id = $1`,
        // @ts-ignore
        [id, token],
    );
}
