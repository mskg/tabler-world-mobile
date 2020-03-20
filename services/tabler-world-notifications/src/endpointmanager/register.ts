import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { Endpoint } from '@mskg/tabler-world-push-client';
import { withDatabase } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import { Environment } from '../Environment';
import { createEndpoint } from './createEndpoint';
import { Row } from './Row';
import { sns } from './sns';
import { storeEndpoint } from './storeEndpoint';

export async function register(
    context: Context,
    registration: {
        principal: IPrincipal,
        endpoint: Endpoint,
    },
) {
    console.log('Working on', registration);

    await withDatabase(context, async (client) => {
        // deviceid will not be
        const endpoint = await client.query<Pick<Row, 'endpoint'>>(
            `
SELECT
    endpoint
from
    userendpoints
where
        id = $1
    and devicetype = $2
    and deviceid = $3
            `,
            // query by pk
            [
                registration.principal.id,
                registration.endpoint.type,
                registration.endpoint.deviceid,
            ],
        );

        // https://docs.aws.amazon.com/sns/latest/dg/mobile-platform-endpoint.html
        let createNeeded = false;
        let updateNeeded = false;
        let arn: string = '';

        // create needed
        if (endpoint.rowCount === 0) {
            console.debug('not found');
            createNeeded = true;
        } else if (endpoint.rowCount === 1) {
            arn = endpoint.rows[0].endpoint;
            console.debug('exists', arn);

            try {
                const existing = await sns.getEndpointAttributes({
                    EndpointArn: arn,
                }).promise();

                updateNeeded = existing.Attributes
                    ? (
                        // tslint:disable-next-line: triple-equals
                        existing.Attributes.Token != registration.endpoint.token
                        // tslint:disable-next-line: triple-equals
                        || existing.Attributes.Enabled == 'false'
                    )
                    : true;

            } catch (e) {
                if ((e as Error).name === 'NotFoundException') {
                    createNeeded = true;
                }

                console.error('Attributes could not be loaded', registration, arn, e);
            }
        }

        console.log('create?', createNeeded, 'update?', updateNeeded);

        if (createNeeded) {
            const result = await createEndpoint(
                registration.endpoint.type === 'ios'
                    ? Environment.SNS.iOS
                    : Environment.SNS.Android,
                registration.endpoint.token,
                {
                    id: registration.principal.id,
                },
            );

            console.log('endpoint is', result);
            await storeEndpoint(
                client,
                registration.principal,
                registration.endpoint,
                result,
            );
        }

        if (updateNeeded) {
            await sns.setEndpointAttributes({
                EndpointArn: arn,
                Attributes: {
                    Token: registration.endpoint.token,
                    Enabled: 'true',
                },
            }).promise();

            await storeEndpoint(
                client,
                registration.principal,
                registration.endpoint,
                arn,
            );
        }

        // this is only for us, sns handels this on its own, see createEndpoint
        await client.query(
            `
delete from userendpoints
WHERE id <> $1 and devicetype = $2 and token = $3
            `,
            [
                registration.principal.id,
                registration.endpoint.type,
                registration.endpoint.token,
            ],
        );
    });
}
