import * as Sentry from '@sentry/node';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

export function captureException(event: APIGatewayProxyEvent, context: Context, err: any) {
  Sentry.withScope(scope => {
    const authorizer = event.requestContext.authorizer || {};
    const { iss, email } = authorizer.claims || { iss: null, email: null };

    scope.setExtra("authorizer", authorizer);
    scope.setUser({
      email,
      ip_address: event.requestContext.identity.sourceIp,
      id: event.requestContext.identity.cognitoIdentityId || undefined,
    });

    const used = process.memoryUsage().rss / 1048576;
    scope.setExtra("memoryUsedInMb", used);
    scope.setExtra("timeRemainingInMsec", context.getRemainingTimeInMillis());
    scope.setExtra("event", event);

    scope.setTags({
      iss,
      lambda: context.functionName,
      version: context.functionVersion,
      memoryLimit: context.memoryLimitInMB.toString(),
      logGroupName: context.logGroupName,
      logStreamName: context.logStreamName,
      requestid: context.awsRequestId,
      extendedRequestId: event.requestContext.extendedRequestId || context.awsRequestId,
      requestTime: event.requestContext.requestTime || '',
      requestTimeEpoch: event.requestContext.requestTimeEpoch.toString() || '',
      stage: event.requestContext.stage,
      accountId: event.requestContext.accountId,
      apiId: event.requestContext.apiId,
      region: process.env.SERVERLESS_REGION || process.env.AWS_REGION || '',
    });

    Sentry.captureException(err);
  });
}
