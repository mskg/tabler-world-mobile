import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';
import { ILogger, Metric, StopWatch } from '@mskg/tabler-world-common';
import { QueryConfig, QueryResult } from 'pg';
import { Environment } from '../Environment';
import { logExecutableSQL } from '../helper/logExecutableSQL';
import { IDataQuery } from '../types/IDataQuery';
import { IDataService } from '../types/IDataService';

const lambda: AWS.Lambda = new xAWS.Lambda(
    EXECUTING_OFFLINE
        ? {
            endpoint: 'http://localhost:3002',
            region: 'eu-west-1',
        }
        : undefined,
);

export class LambdaClient implements IDataService {
    constructor(
        private logger: ILogger,
        private metrics?: Metric,
    ) {
    }

    public async query<T = any, I extends any[] = any[]>(text: string | QueryConfig<I>, parameters?: I): Promise<QueryResult<T>> {
        const lambdaParams: AWS.Lambda.InvocationRequest = {
            FunctionName: EXECUTING_OFFLINE
                ? 'tabler-world-data-service-dev-api'
                : Environment.DataServiceArn,

            InvocationType: 'RequestResponse',
            LogType: 'Tail',

            Payload: JSON.stringify({
                parameters,
                text: typeof (text) === 'string' ? text : text.text,
            } as IDataQuery),
        };

        const id = `SQL${Date.now().toString()}`;
        logExecutableSQL(
            this.logger,
            id,
            typeof (text) === 'string' ? text : text.text,
            parameters,
        );

        const sw = new StopWatch();
        try {
            const result = await lambda.invoke(lambdaParams).promise();
            return JSON.parse(result.Payload as string);
        } finally {
            if (this.metrics) {
                this.metrics.add({ id: 'sql-latency', value: sw.elapsedYs });
            }

            this.logger.debug('[SQL]', id, 'took', sw.elapsedYs, 'ys');
        }
    }
}
