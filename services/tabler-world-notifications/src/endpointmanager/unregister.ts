import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { Endpoint } from '@mskg/tabler-world-push-client';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { Row } from './Row';
import { sns } from './sns';

export async function unregister(
    context: Context,
    registration: {
        principal: IPrincipal,
        endpoint: Endpoint,
    },
) {
    await withDatabase(context, async (client) => {
        // we are not interested in the user here, tokens are unique
        const result = await client.query<Row>(
            `
delete from userendpoints
WHERE  devicetype = $1 and token = $2
RETURNING *
`,
            [
                registration.endpoint.type,
                registration.endpoint.token,
            ],
        );

        for (const row of result.rows) {
            try {
                await sns.deleteEndpoint({
                    EndpointArn: row.endpoint,
                }).promise();
            } catch (e) {
                console.error('Could not remove', registration, row, e);
            }
        }
    });
}

