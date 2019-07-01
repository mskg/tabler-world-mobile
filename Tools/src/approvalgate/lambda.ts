import { APIGatewayProxyHandler } from 'aws-lambda';
import { buildFinished } from './build/buildFinished';
import { registerBuild } from './register/registerBuild';

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  let result;

  if (event.resource == "/register") {
    result = await registerBuild(event);
  }
  else if (event.resource == "/buildfinished") {
    result = await buildFinished(event);
  }

  return result || {
    statusCode: 200,
    body: JSON.stringify({ result: 'OK' }),
  };
}
