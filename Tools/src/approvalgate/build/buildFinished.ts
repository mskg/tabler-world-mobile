import { APIGatewayProxyEvent } from 'aws-lambda';
import crypto from 'crypto';
import { request } from "https";
import safeCompare from 'safe-compare';
import { StartParams } from "../register/StartParams";
import { store } from '../store/instance';
import { BuildParams } from "./BuildParams";

/**
 * Notify VSTS build gate that the build has finished
 */
export async function buildFinished(event: APIGatewayProxyEvent) {
  if (event.body == null) throw new Error("Body is null?");

  if (process.env.IS_OFFLINE !== "true" && process.env.SKIP_WEBHOOK_KEY !== "true") {
    const expoSignature = event.headers['Expo-Signature'];
    const hmac = crypto.createHmac('sha1', process.env.SECRET_WEBHOOK_KEY || "");
    hmac.update(event.body);

    const hash = `sha1=${hmac.digest('hex')}`;
    if (!safeCompare(expoSignature, hash)) {
      throw new Error("Signatures didn't match!");
    }
  }

  const params: BuildParams = JSON.parse(event.body);
  const buildRaw = await store.get(params.id.toLocaleLowerCase());
  if (buildRaw == null) { throw new Error(`Build ${params.id} not found.`); }

  const build = JSON.parse(buildRaw) as StartParams;

  // https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/utility/http-rest-api?view=azure-devops
  const result = {
    "name": "TaskCompleted",
    "taskId": build.TaskInstanceId,
    "jobId": build.JobId,
    "result": "succeeded"
  };

  const postData = JSON.stringify(result);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${build.AuthToken}`,
      'Content-Length': postData.length,
    },
  };

  const uri = `${build.PlanUrl}${build.ProjectId}/_apis/distributedtask/hubs/${build.HubName}/plans/${build.PlanId}/events?api-version=2.0-preview.1`;
  console.log("Uri", uri);
  console.log("Options", options);
  console.log("Result", result);

  await new Promise((resolve, reject) => {
    const req = request(uri, options, (res) => {
      if (res.statusCode !== 200 && res.statusCode !== 204 /* no data */) {
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      res.on('data', (data) => {
        console.debug(data);
      });
      res.on('end', resolve);
    });
    req.on('error', (error) => {
      console.error(error);
      reject(error);
    });
    req.write(postData);
    req.end();
  });
}
