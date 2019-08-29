import { xAWS } from "@mskg/tabler-world-aws";

const lambda = new xAWS.Lambda();

/**
 * Get the lambda event source mapping
 */
export const getEventSourceMapping = async () => {
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

  return { UUID, BatchSize };
};
