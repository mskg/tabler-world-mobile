import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { store } from '../store/instance';
import { StartParams } from "./StartParams";

export async function registerBuild(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>  {
  if (event.body == null) throw new Error("Body is null?");
  console.log("registering build", event.body);

  const params: StartParams = JSON.parse(event.body as string);
  const id = params.BuildUrl.substr(params.BuildUrl.lastIndexOf("/") + 1);

  await store.set(id.toLocaleLowerCase(), event.body as string, {
    ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      id,
    })
  }
}
