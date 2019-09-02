
import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';
import { QueryArrayResult, QueryResult } from 'pg';
import { IDataQuery } from './IDataQuery';
import { IDataService } from './IDataService';
import { ILogger } from './ILogger';

class LambdaClient implements IDataService {
    public static lambda: AWS.Lambda = new xAWS.Lambda(
        EXECUTING_OFFLINE
            ? {
                endpoint: 'http://localhost:3001',
                region: 'eu-west-1',
            }
            : undefined,
    );

    public async query(text: string, values?: any[] | undefined): Promise<QueryResult> {
        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName:
                EXECUTING_OFFLINE
                    ? 'tabler-world-data-service-dev-api'
                    : process.env.dataservice_arn as string,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify({
                text,
                parameters: values,
            } as IDataQuery),
        };

        const result = await LambdaClient.lambda.invoke(lambdaParams).promise();
        return JSON.parse(result.Payload as string) as QueryArrayResult;
    }
}

const remoteClient = new LambdaClient();

export function useDataService<T>(
    // tslint:disable-next-line: variable-name
    _context: { logger: ILogger },
    func: (client: IDataService) => Promise<T>,
): Promise<T> {
    // if (false && EXECUTING_OFFLINE) {
    //     return useDatabase({
    //         logger: context.logger,
    //     }, func);
    // }

    return func(remoteClient);
}
