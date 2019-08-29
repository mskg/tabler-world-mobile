
import { QueryArrayResult, QueryResult } from "pg";
import { IDataQuery } from "./IDataQuery";
import { EXECUTING_OFFLINE } from "@mskg/tabler-world-aws";
import { ILogger } from "./ILogger";
import { xAWS } from "@mskg/tabler-world-aws";
import { IDataService } from "./IDataService";

class LambdaClient implements IDataService {
    static lambda: AWS.Lambda = new xAWS.Lambda(
        EXECUTING_OFFLINE
            ? {
                endpoint: 'http://localhost:3000',
                region: 'eu-west-1',
            }
            : undefined
    );

    async query(text: string, values?: any[] | undefined): Promise<QueryResult> {
        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName:
                EXECUTING_OFFLINE
                    ? "tabler-world-api-dev-data-service"
                    : process.env.dataservice_arn as string,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify({
                text,
                parameters: values
            } as IDataQuery)
        };

        const result = await LambdaClient.lambda.invoke(lambdaParams).promise();
        return JSON.parse(result.Payload as string) as QueryArrayResult;
    }
}

const remoteClient = new LambdaClient();

export function useDataService<T>(
    _context: { logger: ILogger },
    func: (client: IDataService) => Promise<T>
): Promise<T> {
    // if (false && EXECUTING_OFFLINE) {
    //     return useDatabase({
    //         logger: context.logger,
    //     }, func);
    // }

    return func(remoteClient);
}
