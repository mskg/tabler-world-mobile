import * as Sentry from '@sentry/node';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import { captureException } from './captureException';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
});

export const sentryLambdaWrapper = (inner: APIGatewayProxyHandler) => {
    return (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
      try {
      // @ts-ignore
        return inner(event, context, callback);
    } catch (err) {
        captureException(event, context, err);

        Sentry.flush();
        callback(err);
    }
  };
};
