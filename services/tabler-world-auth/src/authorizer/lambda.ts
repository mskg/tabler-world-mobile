import { AuthPolicy, HttpVerb, lookupPrincipal, validateToken } from '@mskg/tabler-world-auth-client';
import { withClient } from '@mskg/tabler-world-rds-client';
import { CustomAuthorizerHandler } from 'aws-lambda';
import { isDemoKey } from './isDemoKey';

// tslint:disable-next-line: export-name
export const handler: CustomAuthorizerHandler = async (event, context) => {
    const token = event.authorizationToken;
    if (!token) {
        console.log('No token provided');
        throw new Error('Unauthorized (token)');
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

    const { principalId, email } = await validateToken(
        process.env.AWS_REGION as string,
        process.env.UserPoolId as string,
        token);

    return await withClient(context, async (client) => {
        const policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
        policy.allowMethod(HttpVerb.OPTIONS, '/graphql');
        policy.allowMethod(HttpVerb.GET, '/graphql');
        policy.allowMethod(HttpVerb.POST, '/graphql');

        const result = policy.build();
        result.context = {
            ... await lookupPrincipal(client, email),
            principalId,
        };

        // this enforces rate throtteling on the API
        result.usageIdentifierKey = `tabler-world-api-lambda-authorizer-${stage}`;
        return result;
    });
};
