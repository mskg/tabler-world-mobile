import { APIGatewayProxyHandler } from 'aws-lambda';
import { buildFinished } from './build/buildFinished';
import { registerBuild } from './register/registerBuild';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  if (event.resource == "/register") {
    await registerBuild(event);
  }
  else if (event.resource == "/buildfinished") {
    await buildFinished(event);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ result: 'OK' }),
  };
}
