
import { ILogger, Metric } from '@mskg/tabler-world-common';

export interface IClientOptions {
    logger: ILogger;
    metrics?: Metric;
    sqlLogLevel?: 'error' | 'debug';
}
