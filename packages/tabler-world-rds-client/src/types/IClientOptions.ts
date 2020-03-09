
import { ILogger, Metric } from '@mskg/tabler-world-common';

export interface IClientOptions {
    logger: ILogger;
    metrics?: Metric;
    logLevel?: 'error' | 'debug';
}
