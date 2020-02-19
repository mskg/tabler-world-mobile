import { AuthPolicy, HttpVerb, IPrincipal, lookupPrincipal, principalToTransport, validateToken } from '@mskg/tabler-world-auth-client';
import { withClient } from '@mskg/tabler-world-rds-client';
import { CustomAuthorizerEvent, CustomAuthorizerResult, Handler } from 'aws-lambda';
import { isDemoKey } from '../helper/isDemoKey';

const UNAUTHORIZED = 'Unauthorized'; // should result in 401

// tslint:disable-next-line: export-name
export const handler: Handler<CustomAuthorizerEvent, CustomAuthorizerResult | void> = async (event, context) => {
    const token = event.authorizationToken;
    if (!token) {
        console.log('No token provided');

        context.fail(UNAUTHORIZED);
        return;
    }

    // Get AWS AccountId and API Options
    const apiOptions: any = {};
    const tmp = event.methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const awsAccountId = tmp[4];
    const stage = apiGatewayArnTmp[1];

    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = stage;

    if (isDemoKey(token)) {
        const demoPolicy = new AuthPolicy('demo', awsAccountId, apiOptions);
        demoPolicy.allowMethod(HttpVerb.OPTIONS, '/graphql-demo');
        demoPolicy.allowMethod(HttpVerb.POST, '/graphql-demo');

        const demoResult = demoPolicy.build();
        demoResult.usageIdentifierKey = token.substring('DEMO '.length);

        return demoResult;
    }

    let principalId: string;
    let email: string;

    try {
        const result = await validateToken(
            process.env.AWS_REGION as string,
            process.env.UserPoolId as string,
            token,
        );

        principalId = result.principalId;
        email = result.email;
    } catch (e) {
        console.error(e);

        context.fail(UNAUTHORIZED);
        return;
    }

    // may result in 500 if DB fails - which is ok
    return await withClient(context, async (client) => {
        let principal: IPrincipal;
        try {
            principal = await lookupPrincipal(client, email);
        } catch (e) {
            console.error(e);

            context.fail(UNAUTHORIZED);
            return;
        }

        const policy = new AuthPolicy(principalId, awsAccountId, apiOptions);

        // GET with short urls
        policy.allowMethod(HttpVerb.GET, '/graphql');

        // Standard
        policy.allowMethod(HttpVerb.OPTIONS, '/graphql');
        policy.allowMethod(HttpVerb.POST, '/graphql');

        const result = policy.build();
        result.context = principalToTransport(principal, principalId);

        // this enforces rate throtteling on the API
        result.usageIdentifierKey = `tabler-world-api-lambda-authorizer-${stage}`;
        return result;
    });
};
