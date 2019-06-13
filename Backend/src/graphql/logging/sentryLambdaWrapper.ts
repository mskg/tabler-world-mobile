import * as Sentry from '@sentry/node';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import { captureException } from './captureException';

Sentry.init({
  dsn: 'https://517fb70666c74447bfa3ad729b667851@sentry.io/1480221',
});

export const sentryLambdaWrapper = (inner: APIGatewayProxyHandler) => {
  return (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
    try {
      //@ts-ignore
      return inner(event, context, callback);
    }
    catch (err) {
      captureException(event, context, err);

      Sentry.flush();
      callback(err);
    }
  }
};