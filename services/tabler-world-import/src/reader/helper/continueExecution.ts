
import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';
import { ContinueEvent } from '../types/ContinueEvent';

const lambda: AWS.Lambda = new xAWS.Lambda(
    EXECUTING_OFFLINE
        ? {
            endpoint: 'http://localhost:3002',
            region: 'eu-west-1',
        }
        : undefined,
);

export async function continueExecution(val: ContinueEvent): Promise<void> {
    // we can check record counts here
    if (val.log.calls > 10) {
        throw new Error('Recursion > 10, check setup!');
    }

    const lambdaParams: AWS.Lambda.InvocationRequest = {
        FunctionName:
            EXECUTING_OFFLINE
                ? 'tabler-world-import-dev-reader'
                : process.env.readerservice_arn as string,

        InvocationType: 'Event',
        Payload: JSON.stringify(val),
    };

    // const result =
    await lambda.invoke(lambdaParams).promise();
}
