
import { QueryArrayResult, QueryResult } from "pg";
import { IDataQuery } from "../../dataservice/types";
import { EXECUTING_OFFLINE } from "../helper/isOffline";
import { ILogger } from "../types/ILogger";
import { xAWS } from "../xray/aws";
import { IDataService } from "./IDataService";
import { useDatabase } from "./useDatabase";

class LambdaClient implements IDataService {
    static lambda: AWS.Lambda = new xAWS.Lambda(
        EXECUTING_OFFLINE
            ? { endpoint: 'http://localhost:3000' }
            : undefined
    );

    async query(text: string, values?: any[] | undefined): Promise<QueryResult> {
        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName: process.env.dataservice_arn as string,
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
    context: { logger: ILogger },
    func: (client: IDataService) => Promise<T>
): Promise<T> {
    if (EXECUTING_OFFLINE) {
        return useDatabase(context, func);
    }

    return func(remoteClient);
}
