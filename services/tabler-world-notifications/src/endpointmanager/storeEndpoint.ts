import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { Endpoint } from '@mskg/tabler-world-push-client';
import { IDataService } from '@mskg/tabler-world-rds-client';

export async function storeEndpoint(
    client: IDataService,
    { id }: IPrincipal,
    { deviceid, type, token }: Endpoint,
    arn: string,
) {
    await client.query(
        `
INSERT INTO userendpoints(id, devicetype, deviceid, token, endpoint)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id, devicetype, deviceid)
    DO UPDATE
    SET token = excluded.token,
        endpoint = excluded.endpoint
        `,
        [
            id,
            deviceid,
            type,
            token,
            arn,
        ],
    );
}
