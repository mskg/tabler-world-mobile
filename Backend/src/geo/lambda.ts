import { SQSHandler } from "aws-lambda";
import { Lambda } from "aws-sdk";
import { withDatabase } from "../shared/rds/withDatabase";
import { encode } from "./encode";
import { IAddress } from "./IAddress";

const lambda = new Lambda();

const getMapping = async () => {
  const listResp = await lambda.listEventSourceMappings({
    EventSourceArn: process.env.sqs_arn,
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    MaxItems: 1,
  }).promise();

  console.log(JSON.stringify(listResp));
  if (listResp.EventSourceMappings == null) {
    return { UUID: undefined, BatchSize: undefined };
  }

  const mapping = listResp.EventSourceMappings[0];
  const { UUID, BatchSize } = mapping;
  return { UUID, BatchSize }
}

const disableEventSource = async () => {
  const eventSourceMapping = await getMapping();
  if (eventSourceMapping.UUID == null) {
    throw new Error("Failed to retrieve eventSourceMapping");
  }

  await lambda.updateEventSourceMapping({
    UUID: eventSourceMapping.UUID,
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    Enabled: false
  }).promise();
}

let disabled = false;

// we have a batchsize of 1
export const handler: SQSHandler = async (event, context, callback) => {
  // kill in flight messages
  if (disabled) throw new Error("disabled due to throtteling");

  // max degree 1
  await withDatabase(context, async (client) => {
    const errors = [];

    for (let message of event.Records) {
      const payload = JSON.parse(message.body) as IAddress[];

      for (const addr of payload) {
        try {
          await encode(client, addr);
        } catch (e) {
          errors.push(e);
          console.log(e);

          if ((e.toString() as string).match(/429/)) {
            // throttle event
            await disableEventSource();
            disabled = true;

            throw new Error("disabled due to throtteling");
          }
        }
      }
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  });

  callback();
}