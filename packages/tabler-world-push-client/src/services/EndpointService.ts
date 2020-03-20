import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';
import { Environment } from '../Environment';
import { Endpoint } from '../types/Endpoint';
import { IPrincipal } from '@mskg/tabler-world-auth-client';

const lambda = new xAWS.Lambda(
    EXECUTING_OFFLINE
        ? {
            endpoint: 'http://localhost:3002',
            region: 'eu-west-1',
        }
        : undefined,
);

export class EndpointService {
    constructor(private arn: string = Environment.PUSH_ENDPOINT_SERVICE) {
    }

    private async call(payload: any) {
        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName: EXECUTING_OFFLINE
                ? 'tabler-world-notifications-dev-endpointmanager'
                : this.arn,

            InvocationType: 'RequestResponse',
            LogType: 'Tail',

            Payload: JSON.stringify(payload),
        };

        const result = await lambda.invoke(lambdaParams).promise();
        return JSON.parse(result.Payload as string);
    }

    public async register(principal: IPrincipal, endpoint: Endpoint) {
        await this.call({
            endpoint,
            principal,
            action: 'register',
        });
    }

    public async unregister(principal: IPrincipal, endpoint: Endpoint) {
        await this.call({
            endpoint,
            principal,
            action: 'unregister',
        });
    }
}
