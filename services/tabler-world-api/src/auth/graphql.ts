import { CustomAuthorizerHandler } from 'aws-lambda';
import { checkAuthorization } from './checkAuthorization';

// tslint:disable-next-line: export-name
export const handler: CustomAuthorizerHandler = async (event, context) => {
    return checkAuthorization(
        context,
        process.env.AWS_REGION as string,
        process.env.UserPoolId as string,
        event.methodArn,
        event.authorizationToken,
        'tabler-world-api-lambda-authorizer',
    );
};
