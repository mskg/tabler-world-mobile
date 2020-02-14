import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { APIGatewayProxyEvent } from 'aws-lambda';

export function isDebugMode(event?: APIGatewayProxyEvent) {
    if (event) {
        const authorizer = event.requestContext.authorizer;

        return authorizer
            ? EXECUTING_OFFLINE && authorizer.principalId === 'offlineContext_authorizer_principalId'
            : false;
    }

    return EXECUTING_OFFLINE;
}
